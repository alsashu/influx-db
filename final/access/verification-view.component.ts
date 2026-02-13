import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, Input } from "@angular/core";
import { VerificationViewActionsService } from "./verification-view-actions.service";
import { IViewComponent } from "../../../services/view/iview.component";
import { ServicesService } from "src/app/services/services/services.service";
import { ServicesConst } from "src/app/services/services/services.const";
import { GenericContextMenuComponent } from "../../app/generic-context-menu/generic-context-menu.component";
import { GenericTreeComponent } from "../../app/generic-tree/generic-tree.component";
import { MvcConst } from "src/app/services/mvc/mvc.const";
import { INodeFactory } from "../../app/generic-tree/tree-factories/inode-factory";
import { ISelectionService } from "src/app/common/services/selection/selection.service";
import { IMetaModelService } from "src/app/services/meta/meta-model.service";
import { IModelService } from "src/app/services/model/model.service";
import { GenericContextMenuService } from "../../app/generic-context-menu/generic-context-menu.service";
import { GenericTreeService } from "../../app/generic-tree/generic-tree.service";
import { VerificationTreeNodeFactory } from "./verif-tree-node-factory/verification-tree.node-factory";
import { IModelVerificationService, ModelVerificationService } from "src/app/services/model/model-verification.service";
import { IRightsService } from "src/app/services/rights/rights.service";
import { RightsConst } from "src/app/services/rights/rights.const";
import { AViewComponent } from "../base/aview.component";
import { VerificationTreeItemService } from "./verification-tree-item/verification-tree-item.service";
import { VerificationViewExcelExportService } from "./export/verification-view.excel.export.service";
import { IModelLoadSaveService } from "src/app/services/model/model-load-save.service";
import { IModalViewService } from "src/app/services/modal/imodal-view.service";
import { IMessageService } from "src/app/services/message/message.service";

@Component({
  selector: "app-verification-view",
  templateUrl: "./verification-view.component.html",
  styleUrls: ["../../app/generic-tree/generic-tree.component.css", "./verification-view.component.css"],
})
/**
 * Verification view component
 */
export class VerificationViewComponent extends AViewComponent implements OnInit, IViewComponent, OnDestroy {
  public static viewType = "verification-view";
  private static lsNameVerificationTree = "alm-rvw-verification-tree";

  @ViewChild(GenericContextMenuComponent, { static: true })
  public mainContextMenuComponent: GenericContextMenuComponent;
  @ViewChild(GenericTreeComponent, { static: true })
  public genericTreeComponent: GenericTreeComponent;

  public options = {
    categoryDisplayMode: true,
  };

  public treeItemOptions = {
    parentView: this,
    isTypeDisplayed: false,
    isKPDisplayed: false,
    isToBeVerifiedFilterActive: false,
    isNotVerifiedFilterActive: false,
    isVerifiedNOKFilterActive: false,
    isVerifiedRulesNOKFilterActive: false,
    isVerifiedOverallNOKFilterActive: false,
    isUndefinedValueVisible: false,
  };

  public filters = {
    defaultFilter: (node: any): boolean => node && !(node.isVisibleFilter === false),
  };

  private refreshTimeOut = null;
  private refreshDelayMs = 1000;

  // Tree
  public nodes: any[] = [];
  public treeNodeFactory: INodeFactory;

  public viewActionsService = new VerificationViewActionsService(this);
  public mvcEventSubscription: any;

  public verificationTreeItemService: VerificationTreeItemService;

  private selectionService: ISelectionService;
  private modelService: IModelService;
  private metaModelService: IMetaModelService;
  public modelVerificationService: IModelVerificationService;
  private rightsService: IRightsService;

  private verificationViewExcelExportService: VerificationViewExcelExportService;
  private modelLoadSaveService: IModelLoadSaveService;
  private modalViewService: IModalViewService;
  private messageService: IMessageService;

  // Auto-save timer
  private autoSaveTimerId: any = null;

  /**
   * Constructor
   * @param changeDetectorRef The ChangeDetectorRef
   * @param genericContextMenuService The GenericContextMenuService
   * @param genericTreeService The GenericTreeService
   * @param servicesService The ServicesService
   */
  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public genericContextMenuService: GenericContextMenuService,
    public genericTreeService: GenericTreeService,
    public servicesService: ServicesService
  ) {
    super(VerificationViewComponent.viewType, servicesService);

    this.selectionService = this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService;
    this.modelService = this.servicesService.getService(ServicesConst.ModelService) as IModelService;
    this.metaModelService = this.servicesService.getService(ServicesConst.MetaModelService) as IMetaModelService;
    this.rightsService = this.servicesService.getService(ServicesConst.RightsService) as IRightsService;
    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;

    this.verificationTreeItemService = new VerificationTreeItemService(servicesService, {
      getOptions: () => this.treeItemOptions,
    });

    this.verificationViewExcelExportService = new VerificationViewExcelExportService(
      this.servicesService,
      () => this.nodes,
      this.treeItemOptions
    );

    this.modelLoadSaveService = this.servicesService.getService(
      ServicesConst.ModelLoadSaveService
    ) as IModelLoadSaveService;
    this.modalViewService = this.servicesService.getService(ServicesConst.ModalViewService) as IModalViewService;
    this.messageService = this.servicesService.getService(ServicesConst.MessageService) as IMessageService;
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    this.initTree();
    this.initMvc();
    // If this view is already selected when component initializes, load verification data
    if (this.viewService.isViewComponentSelected(this)) {
      this.loadVerificationDataIfNeeded().then(() => {
        this.refreshWithDelay();
      });
    }
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    if (this.mvcEventSubscription) {
      this.mvcEventSubscription.unsubscribe();
    }
    this.stopAutoSaveTimer();
  }

  /**
   * Init the tree component
   */
  public initTree() {
    const tc = this.genericTreeComponent;
    tc.treeMemoService.setLocalStorageName(VerificationViewComponent.lsNameVerificationTree);
    tc.options.onSelectObjects = (objects: any[], value: any) => this.selectionService.selectObjects(objects, value);
    tc.options.onNodeMouseDown = (event: any, node: any) => this.onNodeMouseDown(event, node);
    tc.options.onNodeDoubleClick = (event: any, node: any) => this.onNodeDoubleClick(event, node);
    tc.options.onNodeRightClick = (event: any, node: any) => this.onNodeRightClick(event, node);
    tc.options.filter = this.filters.defaultFilter;

    this.treeNodeFactory = new VerificationTreeNodeFactory(tc.treeMemoService, {
      servicesService: this.servicesService,
      rootObject: () => this.modelService.getSelectedProject(),
      rootLabel: () => {
        const label = this.modelService.getSelectedProjectLabel();
        return this.modelVerificationService.isDirty ? label + " *" : label;
      },
      nodeKeyPrefix: () => "verif-node-",
      buildNodeOverlay: (node: any) => this.buildNodeOverlay(node),
      translateLabel: (text: string) => this.translateService.translateFromMap(text),
      translateModelClassName: (text: string) => this.translateService.translateModelClassName(text),
      isTypeExtensionOfTypes: (type: string, extensions: string[]) =>
        this.metaModelService.isTypeExtensionOfTypes(type, extensions),
      isUndefinedValueVisible: () => this.treeItemOptions.isUndefinedValueVisible,
    });
  }

  /**
   * Init the MVC message subscription
   */
  public initMvc() {
    this.mvcEventSubscription = this.mvcService.mvcEvent.subscribe((message: any) => {
      if (
        [
          // MvcConst.MSG_END_LOADING_MODEL, MvcConst.MSG_MODEL_CHANGED,
          MvcConst.MSG_END_SELECTING_PROJECT,
        ].includes(message.type)
      ) {
        // Load verification data and refresh when project is opened
        if (this.viewService.isViewComponentSelected(this)) {
          this.loadVerificationDataIfNeeded().then(() => {
            this.refreshWithDelay();
          });
        }
      } else if ([MvcConst.MSG_BO_SELECTION_CHANGED].includes(message.type)) {
        this.changeDetectorRef.detectChanges();
      } else if (message.type === MvcConst.MSG_RIGHTS_LOADED) {
        this.userCanViewVerificationView();
      } else if (message.type === MvcConst.MSG_PROJECT_CLOSED) {
        this.stopAutoSaveTimer();
        this.modelVerificationService.clearDirty();
        this.refresh();
      } else if (message.type === MvcConst.MSG_VERIFICATION_CHANGED) {
        // A verification modification happened; start auto-save timer if enabled
        this.restartAutoSaveTimerIfNeeded();
        this.refreshWithDelay();
      } else if (message.type === MvcConst.MSG_VERIFICATION_DIRTY_CHANGED) {
        // Dirty state changed; refresh to update the star indicator
        this.refreshWithDelay();
      } else if (message.type === MvcConst.MSG_VIEW_SELECTION_CHANGED) {
        // Load verification data when Verification tab is clicked
        if (this.isThisView(message.view)) {
          this.loadVerificationDataIfNeeded().then(() => {
            // Refresh after verification data is loaded
            this.refreshWithDelay();
          });
        }
      }
    });
  }

  /**
   * Refresh the view with a delay
   */
  public refreshWithDelay() {
    clearTimeout(this.refreshTimeOut);
    this.refreshTimeOut = setTimeout(() => {
      this.refresh();
    }, this.refreshDelayMs);
  }

  /**
   * Function called when the menu button is clicked
   * @param event The event
   */
  public onBtnMenuClicked(event: any) {
    this.showContextMenu(event, this.genericTreeComponent.clickedNode || (this.nodes.length ? this.nodes[0] : null));
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Displays the context menu
   * @param event The event
   * @param element The selected element
   * @param target The html target
   */
  public showContextMenu(event: any, node: any, target: any = null) {
    if (node) {
      this.mainContextMenuComponent.showContextMenu(event, node);
    }
  }

  /**
   * Load verification data if not already loaded (called when Verification tab is clicked)
   * @returns Promise that resolves when verification data is loaded
   */
  private loadVerificationDataIfNeeded(): Promise<void> {
    return this.modelService.loadVerificationDataOnDemand();
  }

  /**
   * Refresh the view
   */
  public refresh() {
    const t0 = new Date();
    console.log(">> Verification tree start refresh. Selected project=", this.modelService.getSelectedProjectLabel());
    this.nodes = this.treeNodeFactory.buildNodes();
    this.updateFilters();
    console.log(">> Verification tree refresh duration=", new Date().valueOf() - t0.valueOf(), "ms");
  }

  /**
   * Overlay function called when building a tree node
   * @param node A node
   * @returns The node
   */
  public buildNodeOverlay(node: any) {
    if (node && node.object) {
      const object = node.object;
      const objectTypeActions: any = this.viewActionsService.objectTypeActionsMap.get(object.type);
      if (objectTypeActions && objectTypeActions.actionNames && objectTypeActions.actionNames.forEach) {
        node.actions = [];
        objectTypeActions.actionNames.forEach((actionName: string) =>
          node.actions.push(this.viewActionsService.nodeActionsMap.get(actionName))
        );
      }
    }
    return node;
  }

  /**
   * On node mouse down event call back
   * @param event The event
   * @param node The node
   */
  public onNodeMouseDown(event: any, node: any) {}

  /**
   * On node double click event call back
   * @param event The event
   * @param node The node
   */
  public onNodeDoubleClick(event: any, node: any) {}

  /**
   * On node right click event call back
   * @param event The event
   * @param node The node
   */
  public onNodeRightClick(event: any, node: any) {
    this.showContextMenu(event, node);
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Get a verification data value of a node
   * @param node The node
   * @param propertyName The name of the property
   * @returns The value of the property
   */
  public getNodeObjectVerificationDataValue(node: any, propertyName: string): any {
    const vd = this.modelVerificationService.getObjectOrPropertyVerificationData(node.object);
    return vd ? vd[propertyName] : null;
  }

  /**
   * Function called when clicking on To Be Verified Filter menu
   */
  public onToBeVerifiedFilter() {
    this.resetFilters();
    this.treeItemOptions.isToBeVerifiedFilterActive = true;
    this.updateFilters();
  }

  /**
   * Function called when clicking on Not Verified Filter menu
   */
  public onNotVerifiedFilter() {
    this.resetFilters();
    this.treeItemOptions.isNotVerifiedFilterActive = true;
    this.updateFilters();
  }

  /**
   *  Function called when clicking on Verified NOK Filter menu
   */
  public onVerifiedNOKFilter() {
    this.resetFilters();
    this.treeItemOptions.isVerifiedNOKFilterActive = true;
    this.updateFilters();
  }

  /**
   *  Function called when clicking on Verified Rules NOK Filter menu
   */
  public onVerifiedRulesNOKFilter() {
    this.resetFilters();
    this.treeItemOptions.isVerifiedRulesNOKFilterActive = true;
    this.updateFilters();
  }

  /**
   *  Function called when clicking on Verified Overall NOK Filter menu
   */
  public onVerifiedOverallNOKFilter() {
    this.resetFilters();
    this.treeItemOptions.isVerifiedOverallNOKFilterActive = true;
    this.updateFilters();
  }

  /**
   * Reset filters
   */
  private resetFilters() {
    this.treeItemOptions.isToBeVerifiedFilterActive = false;
    this.treeItemOptions.isNotVerifiedFilterActive = false;
    this.treeItemOptions.isVerifiedNOKFilterActive = false;
    this.treeItemOptions.isVerifiedRulesNOKFilterActive = false;
    this.treeItemOptions.isVerifiedOverallNOKFilterActive = false;
  }

  /**
   * Update the filter after filter selection modification
   */
  private updateFilters() {
    if (this.treeItemOptions.isToBeVerifiedFilterActive) {
      this.filterToBeVerified();
    } else if (this.treeItemOptions.isNotVerifiedFilterActive) {
      this.filterNotVerified();
    } else if (this.treeItemOptions.isVerifiedNOKFilterActive) {
      this.filterVerifiedNOK();
    } else if (this.treeItemOptions.isVerifiedRulesNOKFilterActive) {
      this.filterVerifiedRulesNOK();
    } else if (this.treeItemOptions.isVerifiedOverallNOKFilterActive) {
      this.filterVerifiedOverallNOK();
    } else {
      this.showAllNodes();
    }
  }

  /**
   * Deploy all nodes
   */
  public showAllNodes() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => (node.isVisibleFilter = true));
  }

  /**
   * Update a parent node (used for filtering)
   * @param node A node
   */
  public updateParentsNode(node: any) {
    if (node && node.isVisibleFilter) {
      this.genericTreeComponent.genericTreeService.forEachParentNodeRec(node, (nodeParent: any) => {
        nodeParent.isVisibleFilter = true;
      });
    }
  }

  /**
   * Apply the filter ToBeVerified
   */
  public filterToBeVerified() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => {
      node.isVisibleFilter =
        this.getNodeObjectVerificationDataValue(
          node,
          ModelVerificationService.verificationProperties.verificationToBeVerified
        ) === true;
      this.updateParentsNode(node);
    });
  }

  /**
   * Apply the filter NotVerified
   */
  public filterNotVerified() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => {
      node.isVisibleFilter =
        this.getNodeObjectVerificationDataValue(
          node,
          ModelVerificationService.verificationProperties.verificationToBeVerified
        ) === true &&
        ![
          ModelVerificationService.verificationStateValues.verifiedOK,
          ModelVerificationService.verificationStateValues.verifiedNOK,
        ].includes(
          this.getNodeObjectVerificationDataValue(
            node,
            ModelVerificationService.verificationProperties.verificationState
          )
        );
      this.updateParentsNode(node);
    });
  }

  /**
   * Apply the filter VerifiedNOK
   */
  public filterVerifiedNOK() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => {
      node.isVisibleFilter =
        this.getNodeObjectVerificationDataValue(
          node,
          ModelVerificationService.verificationProperties.verificationToBeVerified
        ) === true &&
        [ModelVerificationService.verificationStateValues.verifiedNOK].includes(
          this.getNodeObjectVerificationDataValue(
            node,
            ModelVerificationService.verificationProperties.verificationState
          )
        );
      this.updateParentsNode(node);
    });
  }

  /**
   * Apply the filter VerifiedRulesNOK
   */
  public filterVerifiedRulesNOK() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => {
      node.isVisibleFilter = [ModelVerificationService.verificationStateValues.verifiedNOK].includes(
        this.getNodeObjectVerificationDataValue(
          node,
          ModelVerificationService.verificationProperties.verificationRulesState
        )
      );
      this.updateParentsNode(node);
    });
  }

  /**
   * Apply the filter VerifiedOverallNOK
   */
  public filterVerifiedOverallNOK() {
    this.genericTreeComponent.genericTreeService.forEachNodes(this.nodes, (node: any) => {
      node.isVisibleFilter = [ModelVerificationService.verificationStateValues.verifiedNOK].includes(
        this.getNodeObjectVerificationDataValue(
          node,
          ModelVerificationService.verificationProperties.verificationOverallState
        )
      );
      this.updateParentsNode(node);
    });
  }

  /**
   * Test is user can open verification view
   * @returns bool
   */
  public userCanViewVerificationView() {
    return this.rightsService.canRead(RightsConst.VERIFICATION);
  }

  /**
   * Test is user can refresh the view
   * @returns bool
   */
  public userCanRefresh() {
    return true; // this.rightsService.canRead(RightsConst.VERIFICATION);
  }

  /**
   * Toggle undefined values display or not
   */
  public toggleIsUndefinedValueVisible() {
    this.treeItemOptions.isUndefinedValueVisible = !this.treeItemOptions.isUndefinedValueVisible;
    this.refresh();
  }

  /**
   * Function that returns the boolean : the user can make verification
   * @returns bool
   */
  public canVerify() {
    return this.rightsService.canWrite(RightsConst.VERIFICATION);
  }

  /**
   * Function that returns the boolean : the user can answer verification
   * @returns bool
   */
  public canAnswerVerify() {
    return this.rightsService.canWrite(RightsConst.VERIFICATION_ANSWER);
  }

  /**
   * Function that returns the boolean : the user can open verification modal dialog
   * @returns bool
   */
  public canOpenVerifyDialog() {
    return this.canVerify() || this.canAnswerVerify();
  }

  /**
   * Test is user can export
   * @returns bool
   */
  public userCanExport() {
    return this.rightsService.canRead(RightsConst.VERIFICATION);
  }

  /**
   * Export data
   */
  public export() {
    this.verificationViewExcelExportService.export();
  }

  // ─── Auto-Save ──────────────────────────────────────────────────────

  /**
   * Start or restart the auto-save timer if auto-save is enabled and there are unsaved changes
   */
  private restartAutoSaveTimerIfNeeded(): void {
    if (this.modelVerificationService.isAutoSaveEnabled && this.modelVerificationService.isDirty) {
      this.stopAutoSaveTimer();
      const intervalMs = this.modelVerificationService.autoSaveIntervalMinutes * 60 * 1000;
      this.autoSaveTimerId = setTimeout(() => {
        this.performAutoSave();
      }, intervalMs);
    }
  }

  /**
   * Stop the auto-save timer
   */
  private stopAutoSaveTimer(): void {
    if (this.autoSaveTimerId) {
      clearTimeout(this.autoSaveTimerId);
      this.autoSaveTimerId = null;
    }
  }

  /**
   * Perform automatic save of verification data
   */
  private performAutoSave(): void {
    if (!this.modelVerificationService.isDirty) {
      return;
    }
    console.log("[Verification] Auto-save triggered");
    this.modelLoadSaveService.saveSelectedProject().subscribe(
      () => {
        console.log("[Verification] Auto-save completed successfully");
        this.modelVerificationService.clearDirty();
        this.messageService.addTextMessage("Verification data auto-saved successfully.");
      },
      (error: any) => {
        console.error("[Verification] Auto-save failed:", error);
        // Restart timer to retry later
        this.restartAutoSaveTimerIfNeeded();
      }
    );
  }

  // ─── Unsaved Changes Prompt ─────────────────────────────────────────

  /**
   * Check for unsaved changes and prompt the user before proceeding.
   * Returns a promise that resolves to true if it's safe to proceed (no unsaved changes or user chose not to save),
   * or false if the user wants to save first.
   * @param cbSaveAndContinue Callback executed after saving (if user chooses "Yes")
   * @param cbCancel Callback if user dismisses the dialog
   */
  public checkUnsavedChangesBeforeAction(cbSaveAndContinue?: () => void, cbCancel?: () => void): void {
    if (!this.modelVerificationService.isDirty) {
      // No unsaved changes, proceed directly
      if (cbSaveAndContinue) {
        cbSaveAndContinue();
      }
      return;
    }

    this.modalViewService.openMessageModalComponent(
      {
        title: "Unsaved Changes",
        message: "You have unsaved changes. Save before leaving.",
        btnOKLabel: "Yes",
      },
      () => {
        // User clicked "Yes" - save then continue
        this.modelLoadSaveService.saveSelectedProject().subscribe(
          () => {
            this.modelVerificationService.clearDirty();
            this.messageService.addTextMessage("Verification data saved successfully.");
            if (cbSaveAndContinue) {
              cbSaveAndContinue();
            }
          },
          (error: any) => {
            console.error("[Verification] Save failed during unsaved-changes prompt:", error);
          }
        );
      }
    );
  }
}
