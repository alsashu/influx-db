import { Component, OnInit, OnDestroy, ViewChild, ViewChildren, QueryList, ChangeDetectorRef } from "@angular/core";
import { ContextMenuComponent } from "ngx-contextmenu";
import { ModelViewActionsService } from "./model-view-actions.service";
import { GenericContextMenuComponent } from "../../../components/app/generic-context-menu/generic-context-menu.component";
import { GenericContextMenuService } from "../../../components/app/generic-context-menu/generic-context-menu.service";
import { GenericTreeComponent } from "../../app/generic-tree/generic-tree.component";
import { GenericTreeService } from "../../../components/app/generic-tree/generic-tree.service";
import { AViewComponent } from "../base/aview.component";
import { ServicesService } from "src/app/services/services/services.service";
import { IModelMetadataService } from "../../../services/model/model-metadata.service";
import { IModelService } from "../../../services/model/model.service";
import { ModelConstService } from "../../../services/model/model-const.service";
import { ICommandService } from "../../../common/services/command/command.service";
import { ISelectionService } from "../../../common/services/selection/selection.service";
import { IApiService } from "src/app/services/api/api.service";
import { ServicesConst } from "src/app/services/services/services.const";
import { MvcConst } from "src/app/services/mvc/mvc.const";
import { IMetaModelService } from "src/app/services/meta/meta-model.service";
import { TreeMenuNodeFactory } from "./tree-menu.node-factory/tree-menu.node-factory";
import { SaveProjectCommand } from "src/app/commands/project/save-project.cmd";
import { CloseProjectCommand } from "src/app/commands/project/close-project.cmd";
import { OpenProjectCommand } from "src/app/commands/project/open-project.cmd";
import { IRightsService } from "src/app/services/rights/rights.service";
import { IAppConfigService } from "src/app/services/app/app-config.service";
import { GenerateDocCommand } from "src/app/commands/wiki/generate-doc.cmd";
import { GitCloneProjectCommand } from "src/app/commands/git/git-clone-project.cmd";
import { DeleteProjectCommand } from "src/app/commands/project/delete-project.cmd";
import { MessageModalComponent } from "../../modal/message-modal/message-modal.component";
import { IModalViewService } from "src/app/services/modal/imodal-view.service";
import { IWebsocketService } from "src/app/services/websocket/websocket.service";
import { GitPushProjectCommand } from "src/app/commands/git/git-push-project.cmd";
import { AddProjectToComparisonCommand } from "src/app/commands/compare/add-project-to-comparison.cmd";
import { SetProjectToComparisonCommand } from "src/app/commands/compare/set-project-for-comparison.cmd";
import { ICompareService } from "src/app/services/compare/compare.service";
import { UploadProjectCommand } from "src/app/commands/project/upload-project.cmd";
import { DownloadProjectCommand } from "src/app/commands/project/download-project.cmd";
import { IAndroidFSService } from "src/app/services/android/android.fs.service";
import { SaveProjectOnTabletCommand } from "src/app/commands/offline/save-project-on-tablet.cmd";
import { SynchronizeProjectWithServerCommand } from "src/app/commands/offline/synchronize-project-with-server.cmd";
import { IOfflineApiService } from "src/app/services/android/offline-api.service";
import { OpenAndSaveProjectOnTabletCommand } from "src/app/commands/offline/open-save-project-on-tablet.cmd";
import { DeleteProjectFromTabletCommand } from "src/app/commands/offline/delete-project-from-tablet.cmd";
import { environment } from "src/environments/environment";
import { IAndroidService } from "src/app/services/android/android.service";
import { IModelVerificationService } from "src/app/services/model/model-verification.service";

@Component({
  selector: "app-model-view",
  templateUrl: "./model-view.component.html",
  styleUrls: ["./model-view.component.css"],
})
/**
 * Model View Component
 */
export class ModelViewComponent extends AViewComponent implements OnInit, OnDestroy {
  public static viewType = "model-view";
  private static lsNameTreeMemo = "alm-rvw-model-tree";

  @ViewChildren(ContextMenuComponent)
  public contextMenus: QueryList<ContextMenuComponent>;
  @ViewChild("genericContextMenu", { static: true })
  public contextMenu: ContextMenuComponent;
  @ViewChild(GenericContextMenuComponent, { static: true })
  public genericContextMenuComponent: GenericContextMenuComponent;
  @ViewChild(GenericTreeComponent, { static: true })
  public genericTreeComponent: GenericTreeComponent;

  public viewActionsService = new ModelViewActionsService(this);

  public options = {
    openProjectMode: true,
  };

  public mvcEventSubscription: any;

  // Tree
  public nodes: any[] = [];
  public treeMenuNodeFactory: TreeMenuNodeFactory;

  // Commands
  public openProjectCommand: OpenProjectCommand = new OpenProjectCommand();
  public uploadProjectCommand: UploadProjectCommand = new UploadProjectCommand();
  public downloadProjectCommand: DownloadProjectCommand = new DownloadProjectCommand();
  public saveProjectCommand: SaveProjectCommand = new SaveProjectCommand();
  public closeProjectCommand: CloseProjectCommand = new CloseProjectCommand();
  public deleteProjectCommand: DeleteProjectCommand = new DeleteProjectCommand();
  public saveProjectOnTabletCommand: SaveProjectOnTabletCommand = new SaveProjectOnTabletCommand();
  public openAndSaveProjectOnTabletCommand: OpenAndSaveProjectOnTabletCommand = new OpenAndSaveProjectOnTabletCommand();
  public deleteProjectFromTabletCommand: DeleteProjectFromTabletCommand = new DeleteProjectFromTabletCommand();
  public synchronizeProjectWithServerCommand: SynchronizeProjectWithServerCommand =
    new SynchronizeProjectWithServerCommand();

  public gitCloneProjectCommand: GitCloneProjectCommand = new GitCloneProjectCommand();
  public gitPushProjectCommand: GitPushProjectCommand = new GitPushProjectCommand();

  public addProjectToComparisonCommand: AddProjectToComparisonCommand = new AddProjectToComparisonCommand();
  public setProjectToComparisonCommand: SetProjectToComparisonCommand = new SetProjectToComparisonCommand();

  // Refresh with tempo
  private refreshTimeOut = null;
  private refreshDefaultDelayMs = 500;

  private savedProjectsIdsList = [];
  private dirtyProjectsIdsList = [];

  // Services
  public commandService: ICommandService;
  private selectionService: ISelectionService;
  private modelMetadataService: IModelMetadataService;
  private modelService: IModelService;
  private apiService: IApiService;
  private metaModelService: IMetaModelService;
  private rightsService: IRightsService;
  public appConfigService: IAppConfigService;
  public modalViewService: IModalViewService;
  private webSocketService: IWebsocketService;
  private compareService: ICompareService;
  public androidFSService: IAndroidFSService;
  private offlineApiService: IOfflineApiService;
  private androidService: IAndroidService;
  private modelVerificationService: IModelVerificationService;

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
    super(ModelViewComponent.viewType, servicesService);

    this.modelMetadataService = this.servicesService.getService(
      ServicesConst.ModelMetadataService
    ) as IModelMetadataService;
    this.modelService = this.servicesService.getService(ServicesConst.ModelService) as IModelService;
    this.commandService = this.servicesService.getService(ServicesConst.CommandService) as ICommandService;
    this.selectionService = this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService;
    this.apiService = this.servicesService.getService(ServicesConst.ApiService) as IApiService;
    this.metaModelService = this.servicesService.getService(ServicesConst.MetaModelService) as IMetaModelService;
    this.rightsService = this.servicesService.getService(ServicesConst.RightsService) as IRightsService;
    this.appConfigService = this.servicesService.getService(ServicesConst.AppConfigService) as IAppConfigService;
    this.modalViewService = this.servicesService.getService(ServicesConst.ModalViewService) as IModalViewService;
    this.webSocketService = this.servicesService.getService(ServicesConst.WebsocketService) as IWebsocketService;
    this.compareService = this.servicesService.getService(ServicesConst.CompareService) as ICompareService;
    this.androidFSService = this.servicesService.getService(ServicesConst.AndroidFSService) as IAndroidFSService;
    this.offlineApiService = this.servicesService.getService(ServicesConst.OfflineApiService) as IOfflineApiService;
    this.androidService = this.servicesService.getService(ServicesConst.AndroidService) as IAndroidService;
    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;
  }

  /**
   * Indicates if android app
   * @returns
   */
  public isAndroidApp(): boolean {
    return environment.cordova || environment.debugCordova;
  }

  /**
   * ngOnInit
   */
  public ngOnInit() {
    this.initTree();
    this.initMvc();
    this.refresh();

    this.viewActionsService.generateDocumentationMenus();
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {
    if (this.mvcEventSubscription) {
      this.mvcEventSubscription.unsubscribe();
    }
  }

  /**
   * Init the tree component
   */
  public initTree() {
    const tc = this.genericTreeComponent;
    tc.treeMemoService.setLocalStorageName(ModelViewComponent.lsNameTreeMemo);
    tc.options.onSelectObjects = (objects: any[], value: any) => this.selectionService.selectObjects(objects, value);
    tc.options.onNodeMouseDown = (event: any, node: any) => this.onNodeMouseDown(event, node);
    tc.options.onNodeDoubleClick = (event: any, node: any) => this.onNodeDoubleClick(event, node);
    tc.options.onNodeRightClick = (event: any, node: any) => this.onNodeRightClick(event, node);

    this.treeMenuNodeFactory = new TreeMenuNodeFactory(tc.treeMemoService, {
      servicesService: this.servicesService,
      rootObject: () =>
        this.options.openProjectMode ? this.modelService.getModel() : this.modelService.getSelectedProject(),
      rootLabel: () =>
        this.options.openProjectMode
          ? this.translateService.translateFromMap("Projects")
          : this.modelService.getSelectedProjectLabel(),
      nodeKeyPrefix: () => "model-node-",

      modelMap: this.modelMetadataService.modelConfig.modelMap,
      buildNodeOverlay: (node: any) => this.buildNodeOverlay(node),
      translateLabel: (text: string) => this.translateService.translateFromMap(text),
      translateModelClassName: (text: string) => this.translateService.translateModelClassName(text),
      isTypeExtensionOfTypes: (type: string, extensions: string[]) =>
        this.metaModelService.isTypeExtensionOfTypes(type, extensions),
    });
  }

  /**
   * Init the MVC message subscription
   */
  public initMvc() {
    this.mvcEventSubscription = this.mvcService.mvcEvent.subscribe((message: any) => {
      if ([MvcConst.MSG_END_LOADING_MODEL].includes(message.type)) {
        this.refreshWithDelay(0, true);
      } else if (
        [
          MvcConst.MSG_END_SELECTING_PROJECT,
          MvcConst.MSG_END_LOADING_PROJECT_COMPARISON_FILE,
          MvcConst.MSG_RESET_COMPARISON,
          MvcConst.MSG_END_SAVE_PROJECT_ON_TABLET,
          MvcConst.MSG_END_DELETING_PROJECT_FROM_TABLET,
          MvcConst.MSG_PROJECT_IS_DIRTY_CHANGE_ON_TABLET,
        ].includes(message.type)
      ) {
        this.refreshWithDelay(0, true);
      } else if ([MvcConst.MSG_PROJECT_CLOSED].includes(message.type)) {
        this.options.openProjectMode = true;
        this.refresh();
        // } else if ([MvcConst.MSG_BO_SELECTION_CHANGED].includes(message.type)) {
        //   this.refreshWithDelay();
      } else if ([MvcConst.MSG_END_LOADING_APP_CONFIG].includes(message.type)) {
        this.viewActionsService.generateDocumentationMenus();
      } else if ([MvcConst.MSG_VERIFICATION_DIRTY_CHANGED].includes(message.type)) {
        // Refresh to show/hide the unsaved changes star (*) on the project label
        this.refreshWithDelay(0, true);
      }

      if ([MvcConst.MSG_START_SELECTING_PROJECT, MvcConst.MSG_END_SELECTING_PROJECT].includes(message.type)) {
        this.options.openProjectMode = false;
      }
    });
  }

  /**
   * Refresh the view with a delay
   */
  public refreshWithDelay(tempo: number = 0, recalculateNodes: boolean = false) {
    clearTimeout(this.refreshTimeOut);
    this.refreshTimeOut = setTimeout(() => {
      this.refresh(recalculateNodes);
    }, tempo || this.refreshDefaultDelayMs);
  }

  /**
   * Refresh the view
   * @param recalculateNodes Recalculate the nodes
   */
  public refresh(recalculateNodes: boolean = true) {
    if (recalculateNodes) {
      const t0 = new Date();
      this.offlineApiService.getSavedProjectsIdsAsync((res: any) => {
        this.savedProjectsIdsList = res;
        this.offlineApiService.getDirtyProjectsIdsAsync((res1: any) => {
          this.dirtyProjectsIdsList = res1;
          this.nodes = this.getModelNodeFactory().buildNodes();
        });
      });
    }
  }

  /**
   * Getter to the node factory
   * @returns The node factory
   */
  public getModelNodeFactory() {
    return this.treeMenuNodeFactory;
  }

  /**
   * Overlay function called when building a tree node
   * @param node A node
   * @returns The node
   */
  public buildNodeOverlay(node: any) {
    if (node && node.object) {
      const object = node.object;
      const objectTypeActions = this.viewActionsService.objectTypeActionsMap.get(object.type);
      if (objectTypeActions) {
        node.actions = [];
        objectTypeActions.actionNames.forEach((actionName: string) =>
          node.actions.push(this.viewActionsService.nodeActionsMap.get(actionName))
        );
      }

      if (node.object.type === ModelConstService.PROJECT_TYPE) {
        if (node.object === this.modelService.getSelectedProject()) {
          node.icons = [{ icon: ["fas", "check"] }];
        } else if (this.compareService.getCompareProjectList().find((p: any) => p.id === node.object.id)) {
          node.icons = [{ icon: ["fas", "equals"] }];
        }

        // Show unsaved verification changes indicator (star) on the selected project
        if (
          node.object === this.modelService.getSelectedProject() &&
          this.modelVerificationService &&
          this.modelVerificationService.isDirty
        ) {
          if (!node.icons) {
            node.icons = [];
          }
          node.icons.push({
            icon: ["fas", "asterisk"],
            tooltip: this.translateService.translateFromMap("Unsaved verification changes"),
          });
          // Append star to the label
          if (node.label && !node.label.endsWith(" *")) {
            node.label = node.label + " *";
          }
        }

        // Show projects saved on tablet
        if (this.isAndroidApp()) {
          if (this.isProjectSavedOnTablet(node.object)) {
            if (!node.icons) {
              node.icons = [];
            }
            node.icons.push({
              icon: ["fas", "tablet-alt"],
              tooltip: this.translateService.translateFromMap("Project saved locally on tablet"),
            });

            // TODO DRA
            if (this.isProjectDirty(node.object)) {
              node.icons.push({
                icon: ["fas", "star-of-life"],
                tooltip: this.translateService.translateFromMap(
                  "Project modified locally and not pushed to the server"
                ),
              });
            }
          }
        }
      }
    }
    return node;
  }

  /**
   * Test if project is saved on tablet
   * @param project
   * @returns
   */
  public isProjectSavedOnTablet(project): boolean {
    if (this.isAndroidApp()) {
      if (this.savedProjectsIdsList && this.savedProjectsIdsList.length && project && project.id) {
        if (this.savedProjectsIdsList.includes(project.id)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Test if project is saved on tablet
   * @param project
   * @returns
   */
  public isProjectDirty(project): boolean {
    if (this.isAndroidApp()) {
      if (this.dirtyProjectsIdsList && this.dirtyProjectsIdsList.length && project && project.id) {
        if (this.dirtyProjectsIdsList.includes(project.id)) {
          return true;
        }
      }
    }
    return false;
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
  public onNodeDoubleClick(event: any, node: any) {
    if (!((node.nodes && node.nodes.length) || !node.nodesLoaded)) {
      if (event.ctrlKey) {
        if (node.object.type === ModelConstService.DIAGRAM_TYPE) {
          this.onBtnOpenViewClick(node, { altView: true });
        }
      } else {
        if (node.object.type === ModelConstService.PROJECT_TYPE) {
          this.openProject({ project: node.object });
        } else {
          this.onBtnOpenViewClick(node);
        }
      }
    }
  }

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
      this.genericContextMenuComponent.showContextMenu(event, node);
    }
  }

  /**
   * Open a project
   * @param projectData The project data (with id and label)
   */
  public openProject(projectData: any) {
    if (projectData) {
      this.commandService.execute(this.openProjectCommand.init(projectData));
    }
  }

  /**
   * Save button call back
   * @param node The selected node
   */
  public onBtnSaveClick(node: any) {
    this.commandService.execute(this.saveProjectCommand);
  }

  /**
   * Test if user can save
   * @returns bool
   */
  public canSave(): boolean {
    return this.saveProjectCommand.canExecute();
  }

  /**
   * Open view click call back
   * @param node The node
   * @param options The options
   */
  public onBtnOpenViewClick(node: any, options: any = null) {
    options = options || { project: this.modelService.getSelectedProject() };
    // console.log("onBtnOpenViewClick", node, options);
    this.viewService.openViewFromBo(node.object, options);
  }

  /**
   * Test if user  can close project
   * @returns bool
   */
  public canCloseProject(): boolean {
    return this.closeProjectCommand.canExecute();
  }

  /**
   * Close the opened project
   */
  public closeProject() {
    this.commandService.execute(this.closeProjectCommand);
  }

  /**
   * Toggle freeze selection
   */
  public toggleFreezeSelection() {
    this.selectionService.updateSelectionFrozzenStatus();
  }

  /**
   * Convert projects
   */
  public convertProjects() {
    this.modalViewService.openMessageModalComponent(
      {
        message: this.translateService.translateFromMap("Converting projects. Please wait..."),
        cb: (messageModalComponent: MessageModalComponent) => {
          messageModalComponent.buttonsDisabled = true;
          let conversionInProgress = true;
          const wsSubscription = this.webSocketService.eventEmitter.subscribe((wsMessage: any) => {
            if (conversionInProgress) {
              if (wsMessage.type === "ConvertProjectsStart" && wsMessage.projectNameList) {
                messageModalComponent.message =
                  this.translateService.translateFromMap("Converting project(s): ") +
                  wsMessage.projectNameList.join(", ");
              }
            }
          });

          this.apiService.convertProject().subscribe((res: any) => {
            conversionInProgress = false;
            this.modelService.reloadProjectList();
            messageModalComponent.message = this.translateService.translateFromMap("Convertion done.");
            messageModalComponent.buttonsDisabled = false;
            wsSubscription.unsubscribe();
          });
        },
      },
      null
    );
  }

  /**
   * Test if user has admin rights
   * @returns bool
   */
  public userHasAdminRights(): boolean {
    return this.rightsService ? this.rightsService.userHasAdminRights() : false;
  }

  /**
   * Open documentation and display page related to the selected object in the tree node if exists
   * @param node The selected node when clicking the menu
   */
  public onBtnOpenWikiClick(node: any) {
    this.viewService.openWikiViewFromBo(node ? node.object : null);
  }

  /**
   * Generate project documentation menu click call back
   * @param node The selected node when clicking the menu
   */
  public onBtnGenerateDocumentationClick(node: any, wikiTemplate: any) {
    if (node && wikiTemplate && wikiTemplate.templateDir) {
      this.commandService.execute(
        new GenerateDocCommand().init({
          projectId: node ? node.object : null,
          languageCode: wikiTemplate.languageCode ? wikiTemplate.languageCode : this.translateService.languageCode,
          templateDir: wikiTemplate.templateDir,
        })
      );
    }
  }

  /**
   * Open a project and save it on tablet
   * @param projectData The project data (with id and label)
   */
  public openAndSaveProjectOnTablet(projectData: any) {
    if (projectData) {
      this.commandService.execute(this.openAndSaveProjectOnTabletCommand.init(projectData));
    }
  }

  /**
   * Delete a project from the tablet
   * @param projectData The project data (with id and label)
   */
  public deleteProjectFromTablet(projectData: any) {
    if (projectData) {
      this.commandService.execute(this.deleteProjectFromTabletCommand.init(projectData));
    }
  }

  /**
   * Synchronise project between tabler and server
   * @param projectData The project data (with id and label)
   */
  public synchronizeProjectWithServer(projectData: any) {
    if (projectData) {
      this.commandService.execute(this.synchronizeProjectWithServerCommand.init(projectData));
    }
  }

  /**
   * Indiquates if offline or not
   * @returns Boolean
   */
  public getIsOffLine(): boolean {
    return this.webSocketService && this.webSocketService.getIsOffLine();
  }
}
