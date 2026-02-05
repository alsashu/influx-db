import { cloneDeep } from "lodash";
import { ViewConfigService } from "./view-config.service";
import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { MvcConst } from "../mvc/mvc.const";
import { IUserService } from "../user/user.service";
import { ITranslateService } from "../translate/translate.service";
import { IViewFactory } from "./view.factory";
import { IView } from "./iview";
import { v4 as uuid } from "uuid";
import { SessionService } from "../session/session.service";
import { IMvcService } from "../mvc/imvc.service";

export interface IViewService {
  config: any;
  initViews();
  resetConfig(doSave?: boolean);
  saveConfig();
  closeMainViews();
  getViewComponent(view: IView);
  getViewTitle(view: IView): string;
  getViewTooltip(view: IView): string;
  toggleRow(row: any);
  toggleDisabled();
  toggleColumn(column: any);
  refreshColumnVisibility();
  getViewContainerLabel(viewContainer: any): string;
  splitView(splitArea: any, view?: IView, isHorizontaly?: boolean);
  selectView(viewContainerConfig: any, view: IView);
  isViewComponentSelected(viewComponent: any): boolean;
  closeView(splitArea: any, view: IView);
  hideView(splitArea: any, view: IView);
  toggleView(column: any, row: any, view: IView);
  dndView(splitAreaId: any, viewId: string, targetSplitArea: any, targetView: IView);

  openView(view: IView): IView;
  openViewFromBo(bo: any, options?: any): IView;

  openWikiViewFromBo(bo: any): IView;
  openWikiViewPage(url: any): IView;

  onDragEnd(splitArea: any, columnIndex: number, e: { gutterNum: number; sizes: number[] });
  onDoubleClick(splitArea: any, e: any);

  cloneAndCleanConfig(config: any): any;
}

/**
 * Service managing views in main view. A view is a window in the main view workspace.
 */
export class ViewService implements IViewService {
  public config: any = null;
  private mainViewSplitArea: any = null;
  private mainViewContainerSplitArea: any = null;

  private mvcService: IMvcService;
  private userService: IUserService;
  private translateService: ITranslateService;

  /** Constructor */
  constructor(public servicesService: IServicesService, public viewFactory: IViewFactory) {}

  /** Service initialization */
  public initService() {
    this.mvcService = this.servicesService.getService(ServicesConst.MvcService) as IMvcService;
    this.userService = this.servicesService.getService(ServicesConst.UserService) as IUserService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.resetConfig();
  }

  /** Views initialization from views config */
  public initViews() {
    this.resetConfig();
    this.loadUserConfig();
  }

  /**
   * Load the current user view config from the server
   */
  private loadUserConfig() {
    // Reload user config from server
    if (sessionStorage.getItem(SessionService.sessionVar.id)) {
      try {
        this.mvcService.startLoader();
        this.mvcService.emit({ type: MvcConst.MSG_START_LOADING_USER_CONFIG });
        this.userService
          .loadViewConfig()
          .then((res: any) => {
            if (res) {
              if (Object.keys(res).length !== 0) {
                this.setConfig(res);
              }
              this.mvcService.emit({ type: MvcConst.MSG_END_LOADING_USER_CONFIG });
            }
            this.mvcService.stopLoader();
          })
          .catch((error: any) => {
            console.error(error);
          });
      } catch (ex) {
        this.mvcService.stopLoader();
      }
    }
  }

  /**
   * Set config
   * @param config config
   * @returns The config
   */
  public setConfig(config: any): any {
    this.config = config;

    // Migrate config to add any new views to the bottom panel
    this.migrateBottomPanelViews();

    // Search for mainViewContainerData
    this.mainViewContainerSplitArea = null;
    this.mainViewSplitArea = null;

    this.splitAreasForEach((splitArea: any) => {
      if (!splitArea.id) {
        splitArea.id = uuid();
      }
      if (splitArea.config && splitArea.config.views) {
        splitArea.config.views.forEach((view: any) => {
          if (!view.id) {
            view.id = uuid();
          }
        });
      }
      if (!this.mainViewContainerSplitArea && splitArea.config && splitArea.config.isMainView) {
        this.mainViewContainerSplitArea = splitArea;
      }
      if (!this.mainViewSplitArea && splitArea.isMainViewSplitArea) {
        this.mainViewSplitArea = splitArea;
      }
    });
    return this.config;
  }

  /**
   * Get the list of all splitAreas
   * @returns The list of all splitAreas
   */
  private getSplitAreas(): any[] {
    const res = [];
    this.splitAreasForEach((splitArea: any) => res.push(splitArea));
    return res;
  }

  /**
   * Reset config. Applies config defined in ViewConfigService
   */
  public resetConfig(doSave: boolean = false) {
    this.setConfig(cloneDeep(new ViewConfigService().defaultConfig));
    if (doSave) {
      this.saveConfig();
    }
  }

  /**
   * Migrate bottom panel views to ensure new views are present
   */
  private migrateBottomPanelViews() {
    if (!this.config || !this.config.splitAreas) {
      return;
    }

    const requiredViews = [
      { type: "modification-view", title: "Modification", icon: "pen-to-square" },
    ];

    const bottomPanelIdentifiers = ["verification-view", "message-view", "search-view"];

    this.splitAreasForEach((splitArea: any) => {
      if (splitArea.config && splitArea.config.views && splitArea.config.views.length > 0) {
        const existingTypes = splitArea.config.views.map((v: any) => v.type);
        const isBottomPanel = bottomPanelIdentifiers.some((id) => existingTypes.includes(id));

        if (isBottomPanel) {
          splitArea.config.multiView = true;
          requiredViews.forEach((view) => {
            if (!existingTypes.includes(view.type)) {
              splitArea.config.views.push({ ...view });
            }
          });
        }
      }
    });
  }

  /**
   * Save config in local storage and on server (attached to current user)
   */
  public saveConfig() {
    const config = this.cloneAndCleanConfig(this.config);
    this.userService.saveViewConfig(config);
    console.log("saveConfig", config);
  }

  /**
   * For each function to navigate recursively in splitAreas
   * @param cb Callback function
   * @param splitAreas Split area list
   */
  private splitAreasForEach(cb: any, splitAreas: any[] = null, parentSplitArea: any = null) {
    splitAreas = splitAreas || this.config.splitAreas;
    if (splitAreas && splitAreas.forEach) {
      splitAreas.forEach((splitArea: any) => {
        cb(splitArea, parentSplitArea);
        if (splitArea.splitAreas) {
          this.splitAreasForEach(cb, splitArea.splitAreas, splitArea);
        }
      });
    }
  }

  /**
   * Get split Area by id
   * @param id id
   * @returns Found split area, null if not
   */
  private getSplitAreaById(id: string): any {
    let res = null;
    this.splitAreasForEach((splitArea: any) => {
      if (!res && splitArea.id === id) {
        res = splitArea;
      }
    });
    return res;
  }

  /**
   * Get the parent splitArea of a splitArea
   * @param splitArea splitArea
   * @returns The splitArea parent
   */
  private getParentSplitArea(splitArea: any) {
    let res = null;
    // let parent = null;
    if (splitArea && splitArea.id) {
      this.splitAreasForEach((sa: any, parentSplitArea: any) => {
        if (!res) {
          if (sa.id === splitArea.id) {
            res = parentSplitArea;
          }
        }
      });
    }
    return res;
  }

  /**
   * Copy non object properties from one object to a clone
   * @param o Object to be copied
   * @param clone Clone
   */
  private copyPropertiesToClone(o: any, clone: any) {
    for (const propertyName in o) {
      if (typeof o[propertyName] !== "object") {
        clone[propertyName] = o[propertyName];
      }
    }
  }

  /**
   * Clone a split area recursively
   * @param splitArea splitArea to be cloned
   * @returns Cloned split area
   */
  private cloneSplitAreaRec(splitArea: any): any {
    const cloneSplitArea: any = {};
    try {
      if (splitArea && cloneSplitArea) {
        this.copyPropertiesToClone(splitArea, cloneSplitArea);

        if (splitArea.config) {
          cloneSplitArea.config = { views: [] };
          this.copyPropertiesToClone(splitArea.config, cloneSplitArea.config);
          if (splitArea.config.views) {
            splitArea.config.views.forEach((view: any) => {
              const cloneView: any = {};
              this.copyPropertiesToClone(view, cloneView);
              if (view.config) {
                cloneView.config = {};
                this.copyPropertiesToClone(view.config, cloneView.config);
              }
              cloneSplitArea.config.views.push(cloneView);
            });
          }
        }
        if (splitArea.splitAreas) {
          cloneSplitArea.splitAreas = [];
          splitArea.splitAreas.forEach((subSplitArea: any) => {
            cloneSplitArea.splitAreas.push(this.cloneSplitAreaRec(subSplitArea));
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
    return cloneSplitArea;
  }

  /**
   * Clone config without viewComponent link
   * @param config Config to be cloned
   * @returns Cloned config
   */
  public cloneAndCleanConfig(config: any): any {
    return this.cloneSplitAreaRec(config);
  }

  /**
   * Splitter drag end evant
   * @param splitArea The split area
   * @param columnIndex The column index
   * @param e The event data
   */
  public onDragEnd(splitArea: any, columnIndex: number, e: { gutterNum: number; sizes: number[] }) {
    if (splitArea && splitArea.splitAreas) {
      splitArea.splitAreas.forEach((sa: any, index: number) => {
        sa.size = e.sizes[index];
      });
      this.saveConfig();
    }
  }

  /**
   * Splitter double click evant
   * @param splitArea The split area
   * @param e The event data
   */
  public onDoubleClick(splitArea: any, e: any) {
    if (e.target.className === "as-split-gutter-icon") {
      const sg = e.target.parentElement;
      if (sg.parentElement.classList[0] === "as-horizontal") {
        // console.log("onDoubleClick horizontal", e, sg, sg.style.order, sg.parentElement, sg.parentElement.classList[0]);
        const order = sg.style.order;
        const index = order - 1;
        const visibleColumns = this.config.splitAreas.filter((c: any) => c.visible === true);
        if (index === 0 || index === 2) {
          if (visibleColumns[index].size > 2) {
            visibleColumns[1].size += visibleColumns[index].size;
            visibleColumns[index].sizeMemo = visibleColumns[index].size;
            visibleColumns[index].size = 0;
          } else {
            visibleColumns[1].size -= visibleColumns[index].sizeMemo;
            visibleColumns[index].size = visibleColumns[index].sizeMemo;
          }
        }
      } else if (sg.parentElement.classList[0] === "as-vertical") {
        const order = parseInt(sg.style.order, 10);
        const columnIndex = sg.parentElement.parentElement.style.order / 2;
        // console.log("onDoubleClick vertical", e, sg, order, columnIndex);
        if (columnIndex === 1 && order === 1) {
          const index = order;
          const visibleRows = this.config.splitAreas[columnIndex].rows.filter((r: any) => r.visible === true);
          if (visibleRows[index].size > 2) {
            visibleRows[0].size += visibleRows[index].size;
            visibleRows[index].sizeMemo = visibleRows[index].size;
            visibleRows[index].size = 0;
          } else {
            visibleRows[0].size -= visibleRows[index].sizeMemo;
            visibleRows[index].size = visibleRows[index].sizeMemo;
          }
        }
      }
    }
  }

  /**
   * Toggle row visibility
   * @param row The row
   */
  public toggleRow(row: any) {
    row.visible = !row.visible;
    this.refreshColumnVisibility();
  }

  /**
   * Toggle config disable state
   */
  public toggleDisabled() {
    this.config.disabled = !this.config.disabled;
    this.saveConfig();
  }

  /**
   * Toggle column visibility
   * @param column The column
   */
  public toggleColumn(column: any) {
    this.setColumnVisible(column, !column.visible);
  }

  /**
   * Set column visibility
   * @param column The column
   * @param visible The value
   */
  private setColumnVisible(column: any, visible: any) {
    column.visible = visible;
    this.refreshColumnVisibility();
  }

  /**
   *
   * @returns Get list of main rows
   */
  public getRows() {
    let res = [];
    if (this.config && this.config.splitAreas && this.config.splitAreas.forEach) {
      this.config.splitAreas.forEach((c: any) => (res = res.concat(c.splitAreas ? c.splitAreas : [])));
    }
    return res;
  }

  /**
   * Refresh columns visibility based on inside rows visibilities (If no row => hide column)
   */
  public refreshColumnVisibility() {
    this.config.splitAreas.forEach((column: any) => {
      if (column.rows && column.rows.some && !column.rows.some((row: any) => row.visible === true)) {
        column.visible = false;
      }
    });
    this.resizeCentralColumn();
    this.saveConfig();
  }

  /**
   * Resize central column depending of columns visibility and size
   */
  public resizeCentralColumn() {
    if (this.config.splitAreas && this.config.splitAreas.length === 3) {
      const c0 = this.config.splitAreas[0];
      const c1 = this.config.splitAreas[1];
      const c2 = this.config.splitAreas[2];
      let size = 100;
      if (c0.visible) {
        size -= c0.size;
      }
      if (c2.visible) {
        size -= c2.size;
      }
      c1.size = size;
    }
  }

  /**
   * Get the label of a view container
   * @param viewContainer The view container
   * @returns The label
   */
  public getViewContainerLabel(viewContainer: any): string {
    let res = viewContainer ? viewContainer.label : "";
    res = this.translateService.translateFromMap(res);
    return res;
  }

  /**
   * Select a view in a view container
   * @param viewContainerConfig Config of the view container
   * @param view View to be selected
   */
  public selectView(viewContainerConfig: any, view: IView) {
    viewContainerConfig.selectedView = view;
    this.mvcService.emit({ type: MvcConst.MSG_VIEW_SELECTION_CHANGED, view });
  }

  /**
   * Returns if a view component is selected
   * @param viewComponent The view component
   * @returns Bool
   */
  public isViewComponentSelected(viewComponent: any): boolean {
    const parentSplitArea = this.getParentSplitAreaOfViewComponent(viewComponent);
    return (
      viewComponent &&
      parentSplitArea &&
      parentSplitArea.config &&
      parentSplitArea.config.selectedView &&
      parentSplitArea.config.selectedView.config &&
      parentSplitArea.config.selectedView.config.viewComponent === viewComponent
    );
  }

  /**
   * Get the Parent of a Split Area Of a View Component
   * @param viewComponent The view component
   * @returns The parent
   */
  private getParentSplitAreaOfViewComponent(viewComponent: any) {
    let res = null;
    if (viewComponent) {
      this.splitAreasForEach((sa: any, parentSplitArea: any) => {
        if (!res && sa.config && sa.config.views) {
          if (sa.config.views.find((v: any) => v.config && v.config.viewComponent === viewComponent)) {
            res = sa;
          }
        }
      });
    }
    return res;
  }

  /**
   * Get the list of main views
   * @returns List of main views
   */
  private getMainViewsList() {
    let res = [];
    this.getSplitAreas()
      .filter((sa: any) => sa.isMainViewContainer)
      .forEach((sa: any) => {
        res = res.concat(sa.config && sa.config.views ? sa.config.views : []);
      });
    return res;
  }

  /**
   * Hide a view
   * @param splitArea splitArea containing the view
   * @param view The view to be hidden
   */
  public hideView(splitArea: any, view: IView) {
    splitArea.config.selectedView = null;
    splitArea.visible = false;
    this.refreshColumnVisibility();
  }

  /**
   * Toggle view visibility
   * @param column The column
   * @param row The row
   * @param view The view
   */
  public toggleView(column: any, row: any, view: IView) {
    if (!column.visible) {
      row.config.selectedView = view;
      row.visible = true;
      column.visible = true;
    } else {
      if (!row.visible || row.config.selectedView !== view) {
        row.config.selectedView = view;
        row.visible = true;
        column.visible = true;
      } else {
        row.config.selectedView = null;
        row.visible = false;
      }
    }
    this.refreshColumnVisibility();
  }

  /**
   * Search a view in the list of mmain views
   * @param view View to be found
   * @returns The view if found
   */
  private searchMainView(view: IView): any {
    return this.getMainViewsList().find((v: any) => {
      const vc = this.getViewComponent(v);
      return vc && vc.isThisView && vc.isThisView(view);
    });
  }

  /***
   * Get the config of the main view container
   */
  public getSelectedMainViewContainerConfig(): any {
    return this.mainViewSplitArea && this.mainViewSplitArea.splitAreas && this.mainViewSplitArea.splitAreas.length
      ? this.mainViewSplitArea.splitAreas[0].config
      : null;
  }

  /**
   * Open or select if existing a view in the main view container
   * @param view The view
   * @returns The view
   */
  public openView(view: IView): IView {
    let res = view;
    const mainViewContainerConfig = this.getSelectedMainViewContainerConfig();
    if (view && mainViewContainerConfig) {
      const existingView = this.searchMainView(view);
      if (existingView) {
        res = existingView;
      } else {
        if (!res.id) {
          res.id = uuid();
        }
        mainViewContainerConfig.views.push(res);
      }
      mainViewContainerConfig.viewComponent.selectView(res);
      this.saveConfig();
    }
    return res;
  }

  /**
   * Close a view
   * @param config Config of the view container
   * @param view The view to be closed
   */
  public closeView(splitArea: any, view: IView) {
    const config = splitArea.config;
    const index = config.views.indexOf(view);
    if (index > -1) {
      config.views.splice(index, 1);
      this.deleteEmptySplitArea(splitArea);
      this.selectView(config, config.views.length > 0 ? config.views[0] : null);
      this.saveConfig();
    }
  }

  /**
   * Close main views
   */
  public closeMainViews() {
    const mainViewsData = [];
    this.getSplitAreas()
      .filter((sa: any) => sa.isMainViewContainer)
      .forEach((sa: any) => {
        (sa.config && sa.config.views ? sa.config.views : []).forEach((v: IView) => {
          mainViewsData.push({ view: v, splitArea: sa });
        });
      });
    mainViewsData.forEach((mvd: any) => {
      this.closeView(mvd.splitArea, mvd.view);
    });
  }

  /**
   * Get the view component linked to a view
   * @param view The view
   * @returns The view component
   */
  public getViewComponent(view: IView) {
    if (view && view.config && view.config.viewComponent) {
      return view.config.viewComponent;
    }
    return null;
  }

  /**
   * Get the title of a view
   * @param view The view
   * @returns The title
   */
  public getViewTitle(view: IView): string {
    let title = null;
    const vc = this.getViewComponent(view);
    if (vc && vc.getViewTitle) {
      title = vc.getViewTitle();
    }
    title = title || view.title;
    title = this.translateService.translateFromMap(title);
    return title;
  }

  /**
   * Get the tool tip of a view
   * @param view The view
   * @returns The tool tip value
   */
  public getViewTooltip(view: IView): string {
    let title = null;
    const vc = this.getViewComponent(view);
    if (vc && vc.getViewTooltip) {
      title = vc.getViewTooltip();
    }
    title = title || view.title;
    title = this.translateService.translateFromMap(title);
    return title;
  }

  /**
   * Select if existing or open a view from a business object
   * @param bo Object
   * @param options Options
   * @returns The view
   */
  public openViewFromBo(bo: any, options: any = null): IView {
    return this.openView(this.viewFactory.buildViewFromBo(bo, options));
  }

  /**
   * Move a view inside or between view containers
   * @param view The dragged view
   * @param targetView The view dropped
   * @param views The list of the views of the view container
   */
  public moveView(view: IView, targetView: IView, views: IView[]) {
    if (view && targetView) {
      const iView = views.indexOf(view);
      const iTargetView = views.indexOf(targetView);
      if (iView > -1 && iTargetView > -1) {
        if (Math.abs(iView - iTargetView) === 1) {
          views[iView] = targetView;
          views[iTargetView] = view;
        } else {
          views.splice(iTargetView, 0, views.splice(iView, 1)[0]);
        }
      }
      this.saveConfig();
    }
  }

  /**
   * Drag and drop a view on another splitArea/view
   * @param splitAreaId splitArea
   * @param viewId view
   * @param targetSplitArea target splitArea
   * @param targetView target view, null if none
   */
  public dndView(splitAreaId: any, viewId: string, targetSplitArea: any, targetView: IView) {
    if (splitAreaId && viewId && targetSplitArea) {
      const splitArea = this.getSplitAreaById(splitAreaId);
      if (splitArea && splitArea.config && splitArea.config.views) {
        const view = splitArea.config.views.find((v: any) => v.id === viewId);
        if (view) {
          if (splitArea.id === targetSplitArea.id) {
            this.moveView(view, targetView, splitArea.config.views);
          } else {
            const iView = splitArea.config.views.indexOf(view);
            const iTargetView = targetSplitArea.config.views.indexOf(targetView);
            targetSplitArea.config.views.splice(iTargetView, 0, splitArea.config.views.splice(iView, 1)[0]);
            if (splitArea.config.views.length) {
              this.selectView(splitArea.config, splitArea.config.views[0]);
            } else {
              this.deleteEmptySplitArea(splitArea);
            }
            this.selectView(targetSplitArea.config, view);
            this.saveConfig();
          }
        }
      }
    }
  }

  /**
   * Delete empty split area if not the last
   * @param splitArea The split area
   */
  public deleteEmptySplitArea(splitArea: any) {
    if (splitArea && splitArea.config.views.length === 0) {
      const parentSplitArea = this.getParentSplitArea(splitArea);
      if (parentSplitArea && parentSplitArea.splitAreas && parentSplitArea.splitAreas.length > 1) {
        parentSplitArea.splitAreas.splice(parentSplitArea.splitAreas.indexOf(splitArea), 1);
      }
    }
  }

  /**
   * Split a view
   * @param splitArea The split area
   * @param view The view
   * @param isHorizontaly If the split is horizontal or vertical
   */
  public splitView(splitArea: any, view: IView = null, isHorizontaly: boolean = true) {
    const parentSplitArea = this.getParentSplitArea(splitArea);
    if (parentSplitArea && parentSplitArea.splitAreas) {
      parentSplitArea.splitDirection = isHorizontaly ? "horizontal" : "vertical";
      const newSplitArea = {
        id: uuid(),
        visible: true,
        size: 50,
        type: "view-container",
        label: "New main view container",
        isMainViewContainer: true,
        config: {
          isMainView: true,
          views: [],
        },
      };
      // Add new splitArea
      parentSplitArea.splitAreas.push(newSplitArea);
      // Add view to it
      newSplitArea.config.views.push(view);

      // Remove view from previous splitArea
      splitArea.config.views.splice(splitArea.config.views.indexOf(view), 1);
      this.deleteEmptySplitArea(splitArea);
      this.saveConfig();
    }
  }

  // TODO wiki specif code
  /**
   * Open a wiki view from a business object
   * @param bo The object
   * @returns The view
   */
  public openWikiViewFromBo(bo: any): IView {
    const view = this.openView({
      type: "wiki-view",
      title: "Documentation",
      config: {
        selectedBo: bo,
      },
    });
    // Wait for the view to be created before sending a message to open page
    setTimeout(() => this.mvcService.emit({ type: MvcConst.MSG_OPEN_BO_DOCUMENTATION_REQUEST, object: bo }), 100);
    return view;
  }

  /**
   * Open a wiki view and show a page corresponding to an url
   * @param url The url
   * @returns The view
   */
  public openWikiViewPage(url: any): IView {
    const view = this.openView({ type: "wiki-view", title: "Documentation", config: {} });
    // Wait for the view to be created before sending a message to open page
    setTimeout(() => this.mvcService.emit({ type: MvcConst.MSG_OPEN_URL_DOCUMENTATION_REQUEST, url }), 100);
    return view;
  }
}
