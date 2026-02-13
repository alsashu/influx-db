import { cloneDeep } from "lodash";
import { v4 as uuid } from "uuid";
import { QueryService } from "../transaction/query.service";
import { ModelConstService } from "./model-const.service";
import { IMessageService } from "../message/message.service";
import { IApiService } from "../api/api.service";
import { ModelMetadataService } from "./model-metadata.service";
import { CreateCommand } from "../../commands/create.cmd";
import { ModifyCommand } from "../../commands/modify.cmd";
import { ModelDataService } from "./model-data.service";
import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { MvcConst } from "../mvc/mvc.const";
import { ITranslateService } from "../translate/translate.service";
import { IMetaModelService } from "../meta/meta-model.service";
import { SessionService } from "../session/session.service";
import { ModelVisitor } from "./model.visitor";
import { ModelRailMLService } from "./model-railml.service";
import { ModelVerificationService } from "./model-verification.service";
import { ModelLoadSaveService } from "./model-load-save.service";
import { IRightsService } from "../rights/rights.service";
import { IViewService } from "../view/view.service";
import { IMvcService } from "../mvc/imvc.service";
import { IModalViewService } from "../modal/imodal-view.service";
import { MessageModalComponent } from "src/app/components/modal/message-modal/message-modal.component";
import { ISelectionService } from "src/app/common/services/selection/selection.service";

/**
 * Model change interface
 */
export interface IModelChangeService {
  updateChangeStatus(o: any);
}

/**
 * Model service interface
 */
export interface IModelService extends IModelChangeService {
  getModel();

  getModelConfig();

  getLibraries();
  setLibraries(libraries: any[]);
  getLibrary();

  initModel();

  closeProject();
  loadVerificationDataOnDemand(): Promise<void>;
  deleteProjectFromServer(project: any);

  reloadProjectList();

  getSelectedProject(): any;
  setSelectedProject(project: any): any;
  getSelectedProjectLabel(): string;
  openProject(project: any, params?: any);
  reloadInputAndSource(project: any);
  openProjectAndSaveOnTablet(project: any);

  getProjectVersions(project: any): any;
  getSelectedProjectVersions(): any;

  createIdAndTypeBoMap(root: any): any;

  getParentListFromObject(root: any, object: any): any;
  getObjectsByIds(parent: any, ids: string[]): any[];
  getObjectById(parent: any, id: string): any;
  getObjectByIdAndType(parent: any, id: string, types: string[]): any;
  getObjectParentById(object: any, id: string): any;
  getBoObjects(parent: any, cb?: any): any[];
  getObjectByItemIdAndObjectClassName(parent: any, idAndClassName: any): any;
  getObjectByItemIdAndObjectClassNameAndMap(idAndClassName: any, idAndTypeBoMap: any): any;
  getObjectsByItemIdAndObjectClassName(parent: any, idAndClassName: any): any[];
  getObjectsByItemIdAndObjectClassNameList(parent: any, idAndClassNameList: any[]): any[];
  getObjectsFromTypes(parent: any, types: string[]): any[];
  getChildren(object: any, types: string[]): any[];
  getFirstChild(object: any, types: string[]): any;
  getProjectList(): any[];
  getProjectByName(name: string): any;
  getProject(id: string): any;
  getDiagram(projectId: string, id: string): any;
  getDiagrams(project: any): any[];
  getProjectObjectFromId(projectId: string, id: string): any;
  getProjectObjectFromIdAndType(projectId: string, id: string, types: string[]): any;
  formatProjectNameRightAlign(project: any, maxLength?: number): string;

  copyObjectProperties(org: any, dest: any);

  reNewObjectIdRec(object: any): any;
  reNewObjectsIds(objects: any[]): any[];
  reNewProjectId(project: any);
  reNewVersionIdRec(object: any, oldProjectId: string, newProjectId: string): any;

  updateChangeStatus(o: any);
  calcChangeStatus(o: any, oRef: any): any;
  compareObjects(o: any, oRef: any);

  getCreateObjectsCommand(objects: any[], parentList: any[], options?: any): any;
  getOrCreateList(project: any, path: string, propertyName: string);
  getParentListFromType(project: any, type: string, subType?: string): any[];
  copyProperties(objectOrg: any, objectDest: any): boolean;
  getCreateOrUpdateObjectsCommands(project: any, objects: any[], options?: any): any[];
  addObject(object: any): boolean;
  createOrUpdateObjects(project: any, objects: any[], options?: any);
}

/**
 * Model service
 */
export class ModelService implements IModelService {
  public static modelLsName = "right-viewer-model";

  private modelConfig: any = null;
  private model: any = null;
  public libraries: any[] = [];
  private selectedProject: any = null;
  private pendingVerificationData: any = null; // Store verification data until Verification tab is clicked
  private pendingVerificationProjectName: string = null;
  private loadedVerificationProjectName: string = null;

  private modelDataService: ModelDataService;
  private modelMetaDataService: ModelMetadataService;
  private mvcService: IMvcService;
  private messageService: IMessageService;
  private apiService: IApiService;
  private translateService: ITranslateService;
  private metaModelService: IMetaModelService;
  private modelRailMLService: ModelRailMLService;
  private modelVerificationService: ModelVerificationService;
  private modelLoadSaveService: ModelLoadSaveService;
  private rightsService: IRightsService;
  private viewService: IViewService;
  private modalViewService: IModalViewService;
  private selectionService: ISelectionService;

  private queryService: QueryService;

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(private servicesService: IServicesService) {
    this.modelDataService = new ModelDataService();
  }

  /**
   * Service init
   */
  public initService() {
    this.modelMetaDataService = this.servicesService.getService(
      ServicesConst.ModelMetadataService
    ) as ModelMetadataService;
    this.mvcService = this.servicesService.getService(ServicesConst.MvcService) as IMvcService;
    this.messageService = this.servicesService.getService(ServicesConst.MessageService) as IMessageService;
    this.apiService = this.servicesService.getService(ServicesConst.ApiService) as IApiService;
    this.queryService = this.servicesService.getService(ServicesConst.QueryService) as QueryService;
    this.modelRailMLService = this.servicesService.getService(ServicesConst.ModelRailMLService) as ModelRailMLService;
    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as ModelVerificationService;
    this.modelLoadSaveService = this.servicesService.getService(
      ServicesConst.ModelLoadSaveService
    ) as ModelLoadSaveService;
    this.rightsService = this.servicesService.getService(ServicesConst.RightsService) as IRightsService;

    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.metaModelService = this.servicesService.getService(ServicesConst.MetaModelService) as IMetaModelService;
    this.viewService = this.servicesService.getService(ServicesConst.ViewService) as IViewService;
    this.modalViewService = this.servicesService.getService(ServicesConst.ModalViewService) as IModalViewService;
    this.selectionService = this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService;

    this.modelConfig = this.modelMetaDataService.modelConfig;
    this.model = this.modelDataService.model;
    this.libraries = this.modelDataService.libraries;
  }

  /**
   * Init the model
   */
  public initModel() {
    this.model = cloneDeep(this.modelDataService.model);
    localStorage.removeItem(ModelService.modelLsName);
    this.modelLoadSaveService.loadProjectList();
  }

  /**
   * Model getter
   * @returns The model
   */
  public getModel() {
    return this.model;
  }

  /**
   * Get the model config
   * @returns The model config
   */
  public getModelConfig() {
    return this.modelConfig;
  }

  /**
   * Get the libraries
   * @returns The libraries
   */
  public getLibraries() {
    return this.libraries;
  }

  /**
   * Set the libraries
   * @param libraries The libraries value
   */
  public setLibraries(libraries: any[]) {
    this.libraries = libraries;
  }

  /**
   * Get the main library
   * @returns The main library
   */
  public getLibrary() {
    return this.libraries && this.libraries.length ? this.libraries[0] : null;
  }

  /**
   * Get the selected (opened) project
   * @returns The selected project, null if none opened
   */
  public getSelectedProject(): any {
    return this.selectedProject;
  }

  /**
   * Set the selected project
   * @param project The project
   * @returns The project
   */
  public setSelectedProject(project: any): any {
    this.selectedProject = project;
    return project;
  }

  /**
   * Get the label of the selected project
   * @returns String value, "" if no project selected
   */
  public getSelectedProjectLabel(): string {
    const project = this.getSelectedProject();
    return project ? project.label : "";
  }

  /**
   * Get selected project versions defined in GenericADM:versions property
   * @returns The xmlVersion & xsdVersion versions
   */
  public getSelectedProjectVersions(): any {
    return this.getProjectVersions(this.getSelectedProject());
  }

  /**
   * Get project versions defined in GenericADM:versions property
   * @param project The project
   * @returns The xmlVersion & xsdVersion versions
   */
  public getProjectVersions(project: any): any {
    let res = null;
    if (project && project.type === ModelConstService.PROJECT_TYPE && project["metadata"]) {
      const versions = project["metadata"]["GenericADM:versions"];
      if (versions) {
        res = {
          xmlVersion: versions.xmlVersion,
          xsdVersion: versions.xsdVersion,
        };
      }
    }
    return res;
  }

  /**
   * Open a project
   * @param project The opened project
   */
  public openProject(project: any, params: any = null) {
    if (project && project.id && project.projectName) {
      console.log(project);
      this.mvcService.emit({
        type: MvcConst.MSG_START_SELECTING_PROJECT,
        projectId: project.id,
      });
      sessionStorage.setItem(SessionService.sessionVar.selectedProject, project.id);
      sessionStorage.setItem(SessionService.sessionVar.selectedProjectName, project.projectName);
      this.rightsService.setUserRightsForProject(project.projectName);
      this.loadProjectFromId(project, params);
    }
  }

  /**
   * Open project and save it on tablet
   * @param project
   */
  public openProjectAndSaveOnTablet(project: any) {
    this.openProject(project, { openProject: true, saveOnTablet: true });
  }

  /**
   * Reload project list
   */
  public reloadProjectList() {
    this.modelLoadSaveService.reloadProjectList();
  }

  /**
   * Reload input and source
   * @param project
   */
  public reloadInputAndSource(project: any) {
    this.loadProjectFromId(project, { loadInputAndSource: true });
  }

  /**
   * Relaod a project
   * @param project The project with its id
   * @param params Parameters (loadProjectForComparison, loadInputAndSource)
   */
  public loadProjectFromId(project: any, params: any = null) {
    if (project && project.id) {
      this.mvcService.startLoader();
      const saveOnTablet = params && params.saveOnTablet;
      this.apiService.loadProjectFromId(project.id, saveOnTablet).then(
        (res: any) => {
          if (!params || params.openProject || params.loadProjectForComparison) {
            this.modelLoadSaveService.loadProject(res.project);
          }
          if (!params || params.openProject) {
            console.log("loadLibraries");
            this.modelLoadSaveService.loadLibraries(res.libraries);
            this.modelLoadSaveService.loadProjectConfig(res.projectConfig);
            this.metaModelService.loadXsdModel(res.metaModel);
          }
          // Load verification data BEFORE initProjectOnLoad so that initObjectSourceAndStateData
          // attaches metaData to the correct (new) inputSourceAndStateData, not stale data.
          if (!params || params.openProject || params.loadInputAndSource) {
            if (!this.apiService.getIsOffLine()) {
              // Online: Load verification data immediately
              console.log("[Verification] Loading verification data immediately before initProjectOnLoad.",
                "sourceAndState:", !!res.sourceAndState, "isArray:", Array.isArray(res.sourceAndState),
                "length:", res.sourceAndState?.length,
                "projectName:", project.projectName);
              this.modelVerificationService.loadVerificationData(res.sourceAndState, project.projectName);
              this.loadedVerificationProjectName = project.projectName;
              this.pendingVerificationData = null;
              this.pendingVerificationProjectName = null;
            } else {
              // Offline: Store project ID for later loading when tab is clicked
              console.log("[Verification] Offline mode: Verification data will load when Verification tab is clicked");
              this.pendingVerificationData = { projectId: project.id, projectName: project.projectName };
              this.pendingVerificationProjectName = project.projectName;
              this.loadedVerificationProjectName = null;
            }
          }

          this.endProjectLoading(res, params);
        },
        (res: any) => this.mvcService.stopLoader()
      );
    }
  }

  /***
   * Notify end of project loading
   */
  private endProjectLoading(res: any, params: any) {
    if (!params || params.openProject) {
      this.modelRailMLService.initProjectOnLoad(res.project);
      this.selectedProject = res.project;
      this.messageService.addTextMessage(
        this.translateService.translateFromMap("message.project.load") + this.getSelectedProjectLabel()
      );
    }
    this.notifyProjectLoadingEnd(res, params);
  }

  /***
   * Notify end of project loading
   */
  private notifyProjectLoadingEnd(res: any, params: any) {
    this.mvcService.emit({ type: MvcConst.MSG_MODEL_CHANGED });
    if (!params || params.openProject) {
      this.mvcService.emit({
        type: MvcConst.MSG_END_SELECTING_PROJECT,
        project: this.selectedProject,
      });
    }
    if (params && params.loadProjectForComparison) {
      this.mvcService.emit({ type: MvcConst.MSG_END_LOADING_PROJECT_FOR_COMPARISON, project: res.project });
    }
    if (params && params.saveOnTablet) {
      this.modelLoadSaveService.saveSelectedProjectOnTablet();
    }

    this.mvcService.stopLoader();
  }

  /**
   * Close the opened project
   */
  public closeProject() {
    this.viewService.closeMainViews();
    sessionStorage.removeItem(SessionService.sessionVar.selectedProject);
    sessionStorage.removeItem(SessionService.sessionVar.selectedProjectName);
    this.selectedProject = null;
    this.libraries = [];
    this.pendingVerificationData = null;
    this.pendingVerificationProjectName = null;
    this.loadedVerificationProjectName = null;
    this.mvcService.emit({ type: MvcConst.MSG_PROJECT_CLOSED });
  }

  /**
   * Load verification data on demand (when Verification tab is clicked)
   * This method loads verification data that was stored during project load
   * @returns Promise that resolves when verification data is loaded
   */
  public loadVerificationDataOnDemand(): Promise<void> {
    return new Promise((resolve, reject) => {
      const selectedProject = this.getSelectedProject();
      const currentProjectName =
        this.pendingVerificationProjectName ||
        (selectedProject ? selectedProject.projectName || selectedProject.label : null);

      console.log("[Verification] loadVerificationDataOnDemand called. currentProjectName:", currentProjectName,
        "loadedVerificationProjectName:", this.loadedVerificationProjectName,
        "hasPendingData:", !!this.pendingVerificationData);

      // Check if verification data is already loaded for this project
      if (currentProjectName && this.loadedVerificationProjectName === currentProjectName) {
        console.log("[Verification] Verification data already loaded for project:", currentProjectName);
        resolve();
        return;
      }

      // Check if we have pending data
      if (!this.pendingVerificationData) {
        console.log("[Verification] No pending verification data to load");
        resolve();
        return;
      }

      const projectName = currentProjectName || this.getSelectedProjectLabel();

      // Online: Load from stored data
      if (this.pendingVerificationData && !this.pendingVerificationData.projectId) {
        console.log("Loading verification data from stored response data");
        this.modelVerificationService.loadVerificationData(this.pendingVerificationData, projectName);
        this.loadedVerificationProjectName = projectName;
        this.pendingVerificationData = null;
        this.pendingVerificationProjectName = null;
        resolve();
      }
      // Offline: Load from local storage
      else if (this.pendingVerificationData && this.pendingVerificationData.projectId) {
        console.log("Loading verification data from local storage (offline mode)");
        this.apiService
          .getInputAndSource(this.pendingVerificationData.projectId)
          .then((resInS: any) => {
            if (resInS && resInS.data) {
              console.log("getInputAndSource from local ok:", resInS.data);
              this.modelVerificationService.loadVerificationData([resInS.data], projectName);
              this.loadedVerificationProjectName = projectName;
              this.pendingVerificationData = null;
              this.pendingVerificationProjectName = null;
              resolve();
            } else {
              console.log("getInputAndSource from local nok:", resInS);
              resolve(); // Resolve anyway to not block the UI
            }
          })
          .catch((error: any) => {
            console.error("Error loading verification data:", error);
            reject(error);
          });
      } else {
        resolve();
      }
    });
  }

  /**
   * Delete project from server
   * @param project
   */
  public deleteProjectFromServer(project: any) {
    if (project && project.label) {
      this.modalViewService.openMessageModalComponent(
        {
          message: this.translateService.translateFromMap(
            "Do you want to delete the selected project from the server?"
          ),
        },
        () => {
          let params: any = {
            projectId: project.id,
            projectName: project.label,
          };
          this.selectionService.deselectAllObjects();
          this.apiService.deleteProject(params).subscribe((res: any) => {
            this.reloadProjectList();
          });
        }
      );
    }
  }

  public getParentListFromObject(root: any, object: any): any {
    return new ModelVisitor().visitObject(
      root || this.model,
      this.modelConfig.boSearchPropertyList,
      (o: any, parent: any, parentTypeName: string, context: any) => {
        if (o === object && parent[parentTypeName] && parent[parentTypeName].forEach) {
          return parent[parentTypeName];
        }
        return null;
      }
    );
  }

  public getObjectsByIds(parent: any, ids: string[]): any[] {
    const res = [];
    new ModelVisitor().forEachCB(parent || this.model, (o: any) => {
      if (o && ids.includes(o.id)) {
        res.push(o);
      }
    });
    return res;
  }

  public getObjectById(parent: any, id: string): any {
    return new ModelVisitor().findCB(parent || this.model, (o: any) => {
      return o && o.id === id;
    });
  }

  public getObjectByIdAndType(parent: any, id: string, types: string[]): any {
    return new ModelVisitor().findCB(parent || this.model, (o: any) => {
      return o && o.id === id && types && types.includes && types.includes(o.type);
    });
  }

  public getObjectParentById(object: any, id: string): any {
    return new ModelVisitor().visitObject(
      object || this.model,
      this.modelConfig.boSearchPropertyList,
      (o: any, parent: any, parentTypeName: string, context: any) => {
        if (o && o.id === id) {
          return parent;
        }
        return null;
      }
    );
  }

  public getBoObjects(parent: any, cb: any = null): any[] {
    return new ModelVisitor().filterCB(parent || this.model, cb || ((o: any) => true));
  }

  public getObjectByItemIdAndObjectClassName(parent: any, idAndClassName: any): any {
    const bos = this.getObjectsByItemIdAndObjectClassName(parent, idAndClassName);
    return bos ? bos.find((o: any) => true) : null;
  }

  public getObjectsByItemIdAndObjectClassName(parent: any, idAndClassName: any): any[] {
    const ocnUpper = idAndClassName.objectClassName.toUpperCase();
    
    const results = new ModelVisitor().filterCB(
      parent || this.model,
      (o: any) => {
        const match = (
          o &&
          idAndClassName &&
          idAndClassName.itemId === o.id &&
          o.type &&
          o.type.toUpperCase &&
          ocnUpper === o.type.toUpperCase().split(":").pop()
        );
        
        return match;
      },
      null,
      ["GenericADM:typicalITFDiagram"]
    );
    
    return results;
  }

  /**
   * Creates a map of objects from ids and type in a model tree
   * @param root The root object
   * @param prefixToBeDeleted Prefix to be deleted from the type
   * @returns The map
   */
  public createIdAndTypeBoMap(root: any): any {
    const idAndTypeBoMap = new Map();
    new ModelVisitor().forEachCB(
      root,
      (o: any, parent: any, parentTypeName: string) => {
        if (o.id && o.type) {
          let typeKey = o.type.toUpperCase();
          typeKey = typeKey.split(":").pop();
          const key = typeKey + "-" + o.id;
          if (!idAndTypeBoMap.get(key)) {
            idAndTypeBoMap.set(key, o);
          }
        }
      },
      null,
      ["refObject", "svgObject"]
    );
    return idAndTypeBoMap;
  }

  /**
   * Get an object from itemId and objectClassName using a type and id map
   * @param idAndClassName The itemId and objectClassName object
   * @param idAndTypeBoMap The map of objects
   * @returns The foudn object
   */
  public getObjectByItemIdAndObjectClassNameAndMap(idAndClassName: any, idAndTypeBoMap: any): any {
    return idAndTypeBoMap.get(idAndClassName.objectClassName.toUpperCase() + "-" + idAndClassName.itemId);
  }

  public getObjectsByItemIdAndObjectClassNameList(parent: any, idAndClassNameList: any[]): any[] {
    let res = [];
    idAndClassNameList.forEach((idAndClassName: any) => {
      res = res.concat(this.getObjectsByItemIdAndObjectClassName(parent, idAndClassName));
    });
    return res;
  }

  public getObjectsFromTypes(parent: any, types: string[]): any[] {
    return new ModelVisitor().filterCB(
      parent,
      (o: any, theParent: any, propertyName: string) => types.includes(o.type) || types.includes(propertyName)
    );
  }

  public getChildren(object: any, types: string[]): any[] {
    const res = [];
    if (types && object && object.children && object.children.forEach) {
      object.children.forEach((o: any) => {
        if (types.includes(o.type)) {
          res.push(o);
        }
      });
    }
    return res;
  }

  public getFirstChild(object: any, types: string[]): any {
    return this.getChildren(object, types).find((o: any) => true);
  }

  public getProject(id: string): any {
    return this.getObjectById(null, id);
  }

  public getProjectList(): any[] {
    return this.model && this.model.projects ? this.model.projects : [];
  }

  public getProjectByName(name: string): any {
    return this.getProjectList().find((project: any) => project.label === name);
  }

  /**
   * Format project name right text align
   * @param project
   * @returns
   */
  public formatProjectNameRightAlign(project: any, maxLength: number = 10): string {
    return this.formatTextRightAlign(project && project.label ? project.label : "");
  }

  /**
   * Format right text align
   * @param project
   * @returns
   */
  public formatTextRightAlign(text: any, maxLength: number = 10): string {
    let res = text;
    if (res.length > maxLength) {
      res = "..." + res.substring(res.length - maxLength);
    }
    return res;
  }

  /***
   * Get a diagram from its id
   */
  public getDiagram(projectId: string, id: string): any {
    return this.getProjectObjectFromIdAndType(projectId, id, [
      ModelConstService.VISUALIZATION_TYPE,
      ModelConstService.TYPICAL_ITF_DIAGRAM_TYPE,
      ModelConstService.INSTANTIATED_ITF_DIAGRAM_TYPE,
      ModelConstService.TYPICAL_FRAME_DIAGRAM_TYPE,
      ModelConstService.INSTANTIATED_FRAME_DIAGRAM_TYPE,
    ]);
  }

  /***
   * Get diagram list from a list of types
   */
  public getDiagrams(project: any): any[] {
    return this.getObjectsFromTypes(project, [
      ModelConstService.VISUALIZATION_TYPE,
      ModelConstService.TYPICAL_ITF_DIAGRAM_TYPE,
      ModelConstService.INSTANTIATED_ITF_DIAGRAM_TYPE,
      ModelConstService.TYPICAL_FRAME_DIAGRAM_TYPE,
      ModelConstService.INSTANTIATED_FRAME_DIAGRAM_TYPE,
    ]);
  }

  public getProjectObjectFromId(projectId: string, id: string): any {
    return this.getObjectById(this.getProject(projectId), id);
  }

  public getProjectObjectFromIdAndType(projectId: string, id: string, types: string[]): any {
    return this.getObjectByIdAndType(this.getProject(projectId), id, types);
  }

  public copyObjectProperties(org: any, dest: any) {
    if (org && dest) {
      for (const propertyName in org) {
        if (typeof org[propertyName] === "object") {
          dest[propertyName] = org[propertyName];
        }
      }
    }
  }

  public reNewObjectIdRec(object: any): any {
    new ModelVisitor().forEachCB(
      object,
      (o: any, parent: any, parentTypeName: string) => {
        if (o.id !== undefined) {
          o.id = uuid();
        }
        console.log("reNewObjectIdRec", o, o.id);
        return null;
      },
      this.modelConfig.boInitPropertyList
    );
    return object;
  }

  public reNewObjectsIds(objects: any[]): any[] {
    if (objects) {
      objects.forEach((o) => {
        this.reNewObjectIdRec(o);
      });
    }
    return objects;
  }

  public reNewProjectId(project: any) {
    const oldVersionId = project.id;
    project.id = uuid();
    this.reNewVersionIdRec(project, oldVersionId, project.id);
  }

  public reNewVersionIdRec(object: any, oldProjectId: string, newProjectId: string): any {
    new ModelVisitor().forEachCB(
      object,
      (o: any, parent: any, parentTypeName: string) => {
        if (o.projectId === oldProjectId) {
          o.projectId = newProjectId;
        }
        return null;
      },
      this.modelConfig.boInitPropertyList
    );
    return object;
  }

  public updateChangeStatus(o: any) {
    if (o && o.changeMemento) {
      o.changeStatus = this.calcChangeStatus(o, o.changeMemento);
    }
  }

  public calcChangeStatus(o: any, oRef: any): any {
    let res = ModelConstService.CHANGE_STATUS_NEW;
    if (oRef) {
      const pc = this.compareObjects(o, oRef);
      res = pc.length ? ModelConstService.CHANGE_STATUS_MODIFIED : ModelConstService.CHANGE_STATUS_SAME;
    }
    if (o.isDeleted /*&& oRef && !oRef.isDeleted*/) {
      res = ModelConstService.CHANGE_STATUS_DELETED;
    }
    return res;
  }

  public compareObjects(o: any, oRef: any) {
    const res = [];
    if (o && oRef) {
      for (const propertyName in o) {
        if (!this.modelConfig.excludedChangeProperties.includes(propertyName)) {
          const value = o[propertyName];
          const refValue = oRef[propertyName];
          if (typeof value !== "object" && value !== refValue) {
            if (!(propertyName === "isDeleted" && value === false && refValue === undefined)) {
              res.push(propertyName);
            }
          }
        }
      }
    }
    return res;
  }

  public getCreateObjectsCommand(objects: any[], parentList: any[], options: any = null): any {
    return new CreateCommand().initFromParams({ objects, parentList });
  }

  public getOrCreateList(project: any, path: string, propertyName: string) {
    let res = null;
    if (path) {
      const tags = path.split(".");
      let parent = project;
      tags.forEach((tag) => {
        if (tag !== ModelConstService.PROJECT_TYPE) {
          if (parent[tag] === undefined) {
            parent[tag] = { id: uuid(), type: tag };
          }
          parent = parent[tag];
        }
      });
      if (parent) {
        if (typeof parent[propertyName] === "undefined") {
          parent[propertyName] = [];
        }
        res = parent[propertyName];
      }
    }
    return res;
  }

  public getParentListFromType(project: any, type: string, subType: string = null): any[] {
    let res = null;
    if (project) {
      const boTypeMap = this.modelConfig.modelMap;
      let typeData = boTypeMap.get(type);
      if (!typeData) {
        typeData = boTypeMap.get("other");
      }
      // console.log(">> getParentListFromType", type, subType, typeData);
      if (typeData) {
        let parent = typeData.parent;
        if (subType && typeData.parents) {
          typeData.parents.forEach((p) => {
            if (p.subType === subType) {
              parent = p.parent;
            }
          });
        }
        const listData = this.modelConfig.boParentsMap.get(parent);
        if (listData) {
          res = this.getOrCreateList(project, listData.path, listData.property);
          // console.log(">> getParentListFromType", type, subType, typeData, listData, project, res);
        }
      }
    }
    console.log("WARNING: getParentListFromType. Parent list not found for type", type, subType, project);
    return res;
  }

  public copyProperties(objectOrg: any, objectDest: any): boolean {
    let modified = false;
    // tslint:disable-next-line: forin
    for (const propertyName in objectOrg) {
      const existingValue = objectDest[propertyName];
      if (
        existingValue === undefined ||
        (typeof existingValue !== "object" && existingValue !== objectOrg[propertyName])
      ) {
        objectDest[propertyName] = objectOrg[propertyName];
        modified = true;
      }
    }
    return modified;
  }

  public getCreateOrUpdateObjectsCommands(project: any, objects: any[], options: any = null): any[] {
    let cmds = [];
    try {
      const createParams = [];
      const updateParams = [];
      objects.forEach((object) => {
        const pl = this.getParentListFromType(project, object.type, object.subType);
        if (pl) {
          let existingObject = null;
          let modified = false;
          let objectMemo = null;
          if (object.id) {
            existingObject = this.getObjectById(project, object.id);
            if (existingObject) {
              objectMemo = cloneDeep(existingObject);
              modified = this.copyProperties(object, existingObject);
              if (modified) {
                updateParams.push({ object: existingObject, objectMemo });
              }
              if (object["children"] !== undefined) {
                cmds = cmds.concat(this.getCreateOrUpdateChildrenObjectsCommandsRec(project, object, existingObject));
              }
            }
          }
          if (!existingObject) {
            createParams.push({ parentList: pl, object });
          }
        } else {
          console.log("WARNING: createOrUpdateObjects. Parent not found for object", object);
        }
      });
      if (createParams.length) {
        cmds.push(new CreateCommand().init(createParams));
      }
      if (updateParams.length) {
        cmds.push(new ModifyCommand(updateParams));
      }
    } catch (ex) {
      console.error("getCreateOrUpdateObjectsCommands EXCEPTION", ex);
    }
    return cmds;
  }

  private getCreateOrUpdateChildrenObjectsCommandsRec(
    project: any,
    parentObject: any,
    existingParentObject: any
  ): any[] {
    let cmds = [];
    try {
      const createParams = [];
      const updateParams = [];
      const children = parentObject["children"];
      children.forEach((object: any) => {
        let existingObject = null;
        let modified = false;
        let objectMemo = null;
        if (object.id) {
          // tslint:disable-next-line: prefer-conditional-expression
          if (object.id.length > 30) {
            // uuid, not a railML id
            existingObject = this.getFirstChild(existingParentObject, [object.type]);
          } else {
            existingObject = this.getObjectById(existingParentObject, object.id);
          }
        }
        if (existingObject) {
          objectMemo = cloneDeep(existingObject);
          modified = this.copyProperties(object, existingObject);
          if (modified) {
            updateParams.push({ object: existingObject, objectMemo });
          }

          if (object["children"] !== undefined) {
            cmds = cmds.concat(this.getCreateOrUpdateChildrenObjectsCommandsRec(project, object, existingObject));
          }
        } else {
          createParams.push({ parentList: existingParentObject["children"], object });
        }
      });
      if (createParams.length) {
        cmds.push(new CreateCommand().init(createParams));
      }
      if (updateParams.length) {
        cmds.push(new ModifyCommand(updateParams));
      }
    } catch (ex) {
      console.error("getCreateOrUpdateChildrenObjectsCommandsRec EXCEPTION", ex);
    }
    return cmds;
  }

  public addObject(object: any): boolean {
    let res = false;
    const project = this.selectedProject;
    if (object && project) {
      const pl = this.getParentListFromType(project, object.type, object.subType);
      if (pl) {
        this.queryService.add(pl, null, object);
        console.log(">> addObject", project, object, pl);
        res = true;
      }
    }
    return res;
  }

  public createOrUpdateObjects(project: any, objects: any[], options: any = null) {
    try {
      objects.forEach((object) => {
        const pl = this.getParentListFromType(project, object.type, object.subType);
        if (pl) {
          let existingObject = null;
          if (object.id) {
            existingObject = this.getObjectById(project, object.id);
            if (existingObject) {
              // update
              this.copyPropertiesQS(object, existingObject);
              if (object["children"] !== undefined) {
                this.createOrUpdateChildrenObjectsRec(project, object, existingObject);
              }
            }
          }
          console.log(">> createOrUpdateObjects", object, pl, existingObject);

          if (!existingObject && pl) {
            // create
            if (pl.forEach) {
              this.queryService.add(pl, null, object);
            } else if (object.type) {
              this.queryService.modify(pl, object.type, object);
            }
          }
        } else {
          console.log("WARNING: createOrUpdateObjects. Parent not found for object", object);
        }
      });
    } catch (ex) {
      console.error("getCreateOrUpdateObjectsCommands EXCEPTION", ex);
    }
  }

  private copyPropertiesQS(objectOrg: any, objectDest: any): boolean {
    let modified = false;
    // tslint:disable-next-line: forin
    for (const propertyName in objectOrg) {
      const existingValue = objectDest[propertyName];
      if (
        existingValue === undefined ||
        (typeof existingValue !== "object" && existingValue !== objectOrg[propertyName])
      ) {
        this.queryService.modify(objectDest, propertyName, objectOrg[propertyName]);
        modified = true;
      }
    }
    return modified;
  }

  private createOrUpdateChildrenObjectsRec(project: any, parentObject: any, existingParentObject: any) {
    try {
      const children = parentObject["children"];
      children.forEach((object: any) => {
        let existingObject = null;
        let modified = false;
        const objectMemo = null;
        if (object.id) {
          // tslint:disable-next-line: prefer-conditional-expression
          if (object.id.length > 30) {
            // uuid, not a railML id
            existingObject = this.getFirstChild(existingParentObject, [object.type]);
          } else {
            existingObject = this.getObjectById(existingParentObject, object.id);
          }
        }
        if (existingObject) {
          // modify
          modified = this.copyPropertiesQS(object, existingObject);
          if (object["children"] !== undefined) {
            this.createOrUpdateChildrenObjectsRec(project, object, existingObject);
          }
        } else {
          // create
          this.queryService.add(existingParentObject, "children", object);
        }
      });
    } catch (ex) {
      console.error("getCreateOrUpdateChildrenObjectsCommandsRec EXCEPTION", ex);
    }
  }

  /**
   * Get logical groups for a project
   * @param project The project
   * @returns Array of logical groups
   */
  public getLogicalGroups(project: any): any[] {
    const logicalGroups: any[] = [];
    const logicalElements = project["GenericADM:logicalElements"];
    
    if (logicalElements) {
      const groupTypes = [
        "GenericADM:alphaLogicalAreaGroups",
        "GenericADM:betaLogicalAreaGroups", 
        "GenericADM:logicalAreaGroups",
        "GenericADM:specificLogicalAreaGroups"
      ];

      groupTypes.forEach(groupTypeKey => {
        const groups = logicalElements[groupTypeKey];
        if (Array.isArray(groups)) {
          groups.forEach((group: any) => {
            logicalGroups.push({
              ...group,
              groupType: groupTypeKey
            });
          });
        }
      });
    }
    
    return logicalGroups;
  }

  /**
   * Find objects belonging to a logical group
   * @param project The project
   * @param logicalGroupId The logical group ID
   * @returns Array of business objects
   */
  public getObjectsInLogicalGroup(project: any, logicalGroupId: string): any[] {
    const objects: any[] = [];
    const logicalGroups = this.getLogicalGroups(project);
    
    const logicalGroup = logicalGroups.find(group => group.id === logicalGroupId);
    if (logicalGroup && logicalGroup["GenericADM:LinkedLogicalAreas"]) {
      logicalGroup["GenericADM:LinkedLogicalAreas"].forEach((link: any) => {
        const bo = this.getObjectById(project, link.elementIDRef);
        if (bo) {
          objects.push(bo);
        }
      });
    }
    
    return objects;
  }
}
