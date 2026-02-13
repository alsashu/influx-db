import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { ModelService } from "./model.service";
import { IModelVerificationService } from "./model-verification.service";
import { IApiService } from "../api/api.service";
import { MessageService } from "../message/message.service";
import { MvcConst } from "../mvc/mvc.const";
import { MvcService } from "../mvc/mvc.service";
import { TranslateService } from "../translate/translate.service";
import { SessionService } from "../session/session.service";
import { ModelConstService } from "./model-const.service";
import { RightsService } from "../rights/rights.service";
import { IGraphicConfigService } from "../config/graphic-config.service";
import { ModelRailMLService } from "./model-railml.service";
import { IEnvironmentConfigService } from "../config/environment-config.service";
import { Observable } from "rxjs";
import { cloneDeep } from "lodash";
import { IOfflineApiService } from "../android/offline-api.service";

/**
 * Interface of the ModelLoadSaveService
 */
export interface IModelLoadSaveService {
  loadProjectList();
  reloadProjectList();
  loadProject(project: any);
  loadLibraries(libraries: any);
  loadProjectConfig(projectConfig: any);
  saveSelectedProject(): any;
  saveProject(project: any): any;
  testAndLazyLoadVisualization(project: any, diagram: any): boolean;
  testAndLazyLoadTypicalITFDiagram(project: any, diagram: any): boolean;
  testAndLoadSvgDiagram(project: any, diagram: any, svgId: string, afterLoadingCB?: any): boolean;
  // testAndLoadSvgDiagramPage(project: any, diagram: any, svgId: string, page?: string, afterLoadingCB?: any);
  loadSvgDiagram(project: any, lazyDataId: string, diagram: any, mvcObject: any, afterLoadingCB?: any);

  saveSelectedProjectOnTablet(): any;
  deleteProjectFromTablet(project: any);
  synchroniseProjectFromTablet(project: any, cb: any);
}

/**
 * Service managing the loading and saving of the model
 */
export class ModelLoadSaveService implements IModelLoadSaveService {
  private modelService: ModelService;
  private modelVerificationService: IModelVerificationService;
  private mvcService: MvcService;
  private messageService: MessageService;
  private apiService: IApiService;
  private translateService: TranslateService;
  private rightsService: RightsService;
  private graphicConfigService: IGraphicConfigService;
  private environmentConfigService: IEnvironmentConfigService;
  private modelRailMLService: ModelRailMLService;
  private offlineApiService: IOfflineApiService;

  private errorSvgTemplate = "<svg><text x='20' y='30' stroke='rgb(128,0,0)'>%MSG%</text></svg>";
  private errorSvgMessage = "no.svg.error.msg";
  private errorSvg = "";

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(private servicesService: IServicesService) {}

  /**
   * Service init
   */
  public initService() {
    this.modelService = this.servicesService.getService(ServicesConst.ModelService) as ModelService;
    this.mvcService = this.servicesService.getService(ServicesConst.MvcService) as MvcService;
    this.messageService = this.servicesService.getService(ServicesConst.MessageService) as MessageService;
    this.apiService = this.servicesService.getService(ServicesConst.ApiService) as IApiService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as TranslateService;
    this.rightsService = this.servicesService.getService(ServicesConst.RightsService) as RightsService;
    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;
    this.graphicConfigService = this.servicesService.getService(
      ServicesConst.GraphicConfigService
    ) as IGraphicConfigService;
    this.environmentConfigService = this.servicesService.getService(
      ServicesConst.EnvironmentConfigService
    ) as IEnvironmentConfigService;
    this.modelRailMLService = this.servicesService.getService(ServicesConst.ModelRailMLService) as ModelRailMLService;
    this.offlineApiService = this.servicesService.getService(ServicesConst.OfflineApiService) as IOfflineApiService;

    // this.mvcService.mvcEvent.subscribe((message) => {
    //   if (message.type === MvcConst.MSG_VERIFICATION_CHANGED) {
    //     this.setProjectDirty(this.modelService.getSelectedProject(), true);
    //   }
    // });
  }

  /**
   * Load the list of projects and set it in the model service
   */
  public loadProjectList() {
    // Start loading
    this.mvcService.emit({ type: MvcConst.MSG_START_LOADING_MODEL });
    this.apiService.getProjectList().then((projects: any) => {
      if (projects && projects.filter) {
        this.modelService.getModel().projects = projects.filter((project: any) =>
          this.rightsService.canReadProject(project.projectName)
        );
      }
      // console.log(this.modelService.getModel());
      let selectedProjectId = sessionStorage.getItem(SessionService.sessionVar.selectedProject);
      selectedProjectId = selectedProjectId === "null" ? null : selectedProjectId;
      let selectedProjectName = sessionStorage.getItem(SessionService.sessionVar.selectedProjectName);
      selectedProjectName = selectedProjectName === "null" ? null : selectedProjectName;

      // End loading
      this.mvcService.emit({
        type: MvcConst.MSG_END_LOADING_MODEL,
        model: this.modelService.getModel(),
        selectedProject: selectedProjectId ? selectedProjectId : null,
      });

      // Open previous opened project
      if (selectedProjectId) {
        this.modelService.openProject({ id: selectedProjectId, projectName: selectedProjectName });
      }
    });
  }

  /**
   * Reload project list
   */
  public reloadProjectList() {
    this.loadProjectList();
  }

  /**
   * Load a project
   * @param project The project data with an id
   */
  public loadProject(project: any) {
    const projectId = project ? project.id : null;
    if (projectId) {
      const index = this.modelService.getModel().projects.findIndex((p: any) => p.id === projectId);
      this.modelService.getModel().projects[index] = project;
      // Adding property
      project.isLoaded = true;
    }
  }

  /**
   * Load libraries
   * @param libraries The libraries
   */
  public loadLibraries(libraries: any) {
    try {
      // console.log("ModelService.loadLibrariesFromServer", libraries);
      libraries = libraries && libraries.forEach ? libraries : [];
      libraries.forEach((library: any) => {
        library.boSvgObjectTypeMap = new Map(library.boSvgObjectTypeMapArray);
      });
      this.modelService.setLibraries(libraries);
      this.mvcService.emit({ type: MvcConst.MSG_MODEL_CHANGED });
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * Load project config
   * @param projectConfig The project config
   */
  public loadProjectConfig(projectConfig: any) {
    try {
      const gconfig = projectConfig ? projectConfig.find((c: any) => c.type === "gconfig").gconfig : null;
      this.graphicConfigService.setGConfig(gconfig);
      const environmentSettings = projectConfig
        ? projectConfig.find((c: any) => c.type === "environmentsettings").environmentsettings
        : null;
      this.environmentConfigService.setEnvironmentSettings(environmentSettings);
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * Save the selected project
   */
  public saveSelectedProject(): any {
    return this.saveProject(this.modelService.getSelectedProject());
  }

  /**
   * Save the selected project on tablet
   */
  public saveSelectedProjectOnTablet(): any {
    return this.saveProjectOnTablet(this.modelService.getSelectedProject());
  }

  /**
   * Save a project on tablet
   */
  private saveProjectOnTablet(project: any): any {
    const supportedViewTypes = [
      "TrackLayout",
      "TracksidePhysicalArchitecture",
      "OnboardPhysicalArchitecture",
      "LogicalInterface",
      "AssemblyConfiguration",
      "IOMapping",
    ];
    if (project && project.type === ModelConstService.PROJECT_TYPE) {
      // Save diagrams
      const diagramList = this.modelService
        .getDiagrams(project)
        .filter((diagram: any) => supportedViewTypes.includes(diagram.viewType));
      diagramList.forEach((diagram: any) => {
        this.saveDiagramOnTablet(project, diagram);
      });
      // Save input and source
      this.saveProject(project);

      // Notify
      this.mvcService.emit({
        type: MvcConst.MSG_END_SAVE_PROJECT_ON_TABLET,
        project,
      });
    }

    // categoryTypes: ["visualization"],
    // viewTypes: [
    //   "TrackLayout",
    //   "TracksidePhysicalArchitecture",
    //   "OnboardPhysicalArchitecture",
    //   "LogicalInterface",
    //   "AssemblyConfiguration",
    //   "IOMapping",

    return new Observable((observer: any) => {
      observer.complete();
    });
  }

  /**
   * Delete a project from tablet
   * @param project
   */
  public deleteProjectFromTablet(project: any) {
    if (project && project.id) {
      // Delete all entries including id= or projectId= project.id
      this.offlineApiService.getKeysIncluding(["id=" + project.id, "projectId=" + project.id], (keys: string[]) => {
        keys.forEach((key: string) => {
          this.offlineApiService.deleteData(key);
        });
        this.mvcService.emit({
          type: MvcConst.MSG_END_DELETING_PROJECT_FROM_TABLET,
          project,
        });
      });
    }
    // "SERVER-DATA-GET-/api/model/project/?id="
    // "SERVER-DATA-GET-/api/model/svg//?svgFileName=0.svg&projectId="
    // "SAVED-DATA-POST-/api/model/save/InputAndSource/?id="
    // "SAVED-DATA-POST-/api/model/isDirty//?id="
  }

  /**
   * Delete a project isDirty info from tablet
   * @param project Project
   */
  public deleteProjectIsDirtyFromTablet(project: any) {
    if (project && project.id) {
      // Delete all entries including /isDirty//?id=projectId
      this.offlineApiService.getKeysIncluding(["/isDirty//?id=" + project.id], (keys: string[]) => {
        keys.forEach((key: string) => {
          this.offlineApiService.deleteData(key).subscribe(
            (res: any) => {
              this.mvcService.emit({
                type: MvcConst.MSG_PROJECT_IS_DIRTY_CHANGE_ON_TABLET,
                project,
                isDirty: false,
              });
            },
            (error: any) => {},
            () => {
              this.mvcService.emit({
                type: MvcConst.MSG_PROJECT_IS_DIRTY_CHANGE_ON_TABLET,
                project,
                isDirty: false,
              });
            }
          );
        });
      });
    }
  }

  /**
   * Synchronise project from tablet with server (push local input and source on the server)
   * @param project
   */
  public synchroniseProjectFromTablet(project: any, cb: any) {
    if (project && project.id) {
      const url = "/api/model/save/InputAndSource/?id=" + project.id;
      this.offlineApiService.getKeysIncluding([url], (keys: string[]) => {
        keys.forEach((key: string) => {
          this.offlineApiService.getData(url, null).then((res: any) => {
            console.log(key, project, res);
            if (res && res.data && res.data.fileName) {
              this.saveVerificationData(project, res.data).subscribe(
                (data: any) => {
                  console.log(data);
                  this.setProjectDirty(project, false);
                  if (cb) {
                    cb();
                  }
                },
                (error: any) => {
                  console.error("Error saving project:", error);
                },
                (data: any) => {
                  console.log(data);
                  this.setProjectDirty(project, false);
                  if (cb) {
                    cb();
                  }
                }
              );
              // TODO message?...
            }
          });
        });
      });
    }
  }

  /**
   * Set the project dirty on not (modified locally but not pushed to the server)
   * @param project project
   * @param value boolean value
   */
  public setProjectDirty(project: any, value: boolean) {
    console.log("setProjectDirty", project.id, value);
    if (project && project.id) {
      let doNotify = false;
      if (value && this.getIsOffLine()) {
        doNotify = true;
        this.apiService.setProjetIsDirty(project.id).subscribe(
          (res: any) => {},
          (error: any) => {},
          () => {
            this.mvcService.emit({
              type: MvcConst.MSG_PROJECT_IS_DIRTY_CHANGE_ON_TABLET,
              project,
              isDirty: true,
            });
          }
        );
      }
      if (!value && !this.getIsOffLine()) {
        doNotify = true;
        this.deleteProjectIsDirtyFromTablet(project);
      }
    }
  }

  /**
   * Indiquates if offline or not
   * @returns Boolean
   */
  public getIsOffLine(): boolean {
    return this.apiService && this.apiService.getIsOffLine();
  }

  /**
   * Save diagram on tablet (Load the file from server and automatically save it locally on tablet)
   * @param project
   * @param diagram
   */
  private saveDiagramOnTablet(project: any, diagram: any) {
    if (
      project &&
      project.type === ModelConstService.PROJECT_TYPE &&
      project.id &&
      diagram &&
      diagram.id &&
      diagram.useSvgDiagram
    ) {
      if (diagram.viewType === ModelConstService.LOGICAL_INTERFACE_DIAGRAM_TYPE) {
        if (diagram.pages !== undefined) {
          const pages = diagram.pages.split(",");
          pages.forEach((page: string) => {
            const svgFileName =
              (diagram.svgFileName || diagram.id).replace("_page_1", "").replace(".svg", "") + "_page_" + page + ".svg";
            this.apiService.loadSvgFile(project.id, svgFileName).then((loadedData: any) => {
              console.log("svg saved on tablet:", svgFileName, project.id);
            });
          });
        }
      } else {
        const svgFileName = (diagram.svgFileName || diagram.id).replace(".svg", "") + ".svg";
        this.apiService.loadSvgFile(project.id, svgFileName).then((loadedData: any) => {
          console.log("svg saved on tablet:", svgFileName, project.id);
        });
      }
    }
  }

  /**
   * Save a project
   * @param project The project
   */
  public saveProject(project: any): any {
    if (project && project.type === ModelConstService.PROJECT_TYPE) {
      const verificationDataToSave = this.modelVerificationService.getVerificationDataToSave();
      console.log("[Verification] saveProject: projectName:", project.projectName,
        "projectId:", project.id,
        "verificationDataToSave.fileName:", verificationDataToSave?.fileName,
        "hasContent:", !!verificationDataToSave?.content);
      return this.saveVerificationData(project, verificationDataToSave);
    }
    console.warn("[Verification] saveProject: project is null or wrong type", project?.type);
    return new Observable((observer: any) => {
      observer.complete();
    });
  }

  /**
   * Save verification data (input and source)
   * @param project
   * @param verificationData
   * @returns
   */
  private saveVerificationData(project: any, verificationData: any): any {
    if (project && project.type === ModelConstService.PROJECT_TYPE) {
      if (verificationData.fileName) {
        if (this.getIsOffLine()) {
          this.setProjectDirty(project, true);
        }
        console.log("[Verification] saveVerificationData: sending to API.",
          "fileName:", verificationData.fileName,
          "projectId:", project.id,
          "projectName:", project.projectName,
          "path:", project.path,
          "isOffLine:", this.getIsOffLine());
        return this.apiService.saveInputAndSource(verificationData, project.id, project.projectName, project.path);
      }
      console.warn("[Verification] saveVerificationData: fileName is empty, NOT saving");
    }
    return new Observable((observer: any) => {
      observer.complete();
    });
  }

  /**
   * Test and lazy loading of a visualization
   * @param projectId The id of the project
   * @param visualizationId The id of the visualization
   */
  public testAndLazyLoadVisualization(project: any, diagram: any): boolean {
    if (diagram && !diagram.lazyLoaded) {
      this.lazyLoadData(project, diagram, diagram.id, diagram, (loadedData: any) => {});
      return true;
    }
    return false;
  }

  /**
   * Test and lazy loading of a Typical ITF Diagram
   * @param project The project
   * @param diagram The diagram
   * @returns True if the diagram has lazyLoaded property equals true
   */
  public testAndLazyLoadTypicalITFDiagram(project: any, diagram: any): boolean {
    if (diagram && diagram.typicalITFDiagramVis && !diagram.typicalITFDiagramVis.lazyLoaded) {
      this.lazyLoadData(
        project,
        diagram.typicalITFDiagramVis,
        diagram.typicalITFDiagramVis.id,
        diagram,
        (loadedData: any) => {}
      );
      return true;
    }
    return false;
  }

  /**
   * Lazy load data
   * @param project The project
   * @param lazyData The lazy load data
   * @param lazyDataId The id of the lazy load data (file name without extension)
   * @param mvcObject The object in the mvc message
   * @param cb A call back called after lazy loading
   */
  private lazyLoadData(project: any, lazyData: any, lazyDataId: string, mvcObject: any, cb: any = null) {
    if (project && lazyData) {
      this.mvcService.emit({
        type: MvcConst.MSG_START_LAZY_LOADING,
        project,
        object: mvcObject,
      });
      this.apiService.lazyLoadData(project.id, lazyDataId).then((loadedData: any) => {
        lazyData.lazyLoaded = true;
        this.modelService.copyObjectProperties(loadedData, lazyData);
        this.modelRailMLService.initLazyLoadedData(project, lazyData);
        if (cb) {
          cb(loadedData);
        }
        this.mvcService.emit({
          type: MvcConst.MSG_END_LAZY_LOADING,
          project,
          object: mvcObject,
        });
      });
    }
  }

  /**
   * Test and load of a svg diagram
   * @param projectId The id of the project
   * @param diagram The diagram
   * @param svgId The id of the svg (the name without extension)
   * @param visualizationId The id of the visualization
   */
  public testAndLoadSvgDiagram(
    project: any,
    diagram: any,
    svgId: string,
    afterLoadingCB: any = (loadedData: any) => {}
  ): boolean {
    if (diagram) {
      this.loadSvgDiagram(project, svgId, diagram, diagram, afterLoadingCB);
      return true;
    }
    return false;
  }

  /**
   * Loading of an svg diagram
   * @param project The project
   * @param lazyDataId The lazy data id
   * @param diagram The lazy load data
   * @param mvcObject The object in the mvc message
   * @param afterLoadingCB A call back called after lazy loading
   */
  public loadSvgDiagram(project: any, lazyDataId: string, diagram: any, mvcObject: any, afterLoadingCB: any = null) {
    if (project && diagram) {
      this.mvcService.emit({
        type: MvcConst.MSG_START_SVG_DIAGRAM_LOADING,
        project,
        object: mvcObject,
      });

      if (!this.errorSvg) {
        this.errorSvg = this.errorSvgTemplate.replace(
          "%MSG%",
          this.translateService.translateFromMap(this.errorSvgMessage)
        );
      }

      if (diagram.useSvgDiagram) {
        this.apiService.loadSvgFile(project.id, lazyDataId).then((loadedData: any) => {
          if (loadedData === "exception") {
            loadedData = this.errorSvg;
          }
          this.afterLoadingData(project, diagram, mvcObject, loadedData, afterLoadingCB);
        });
      } else {
        this.afterLoadingData(project, diagram, mvcObject, this.errorSvg, afterLoadingCB);
      }
    }
  }

  /**
   * After loading svg file data
   * @param project The project
   * @param diagram The lazy load data
   * @param mvcObject The object in the mvc message
   * @param loadedData The svg data string
   * @param afterLoadingCB A call back called after lazy loading
   */
  private afterLoadingData(project: any, diagram: any, mvcObject: any, loadedData: any, afterLoadingCB: any) {
    diagram.isSvgDiagramLoaded = true;
    if (afterLoadingCB) {
      afterLoadingCB(loadedData);
    }
    this.mvcService.emit({
      type: MvcConst.MSG_END_SVG_DIAGRAM_LOADING,
      project,
      object: mvcObject,
      svg: loadedData,
    });
  }
}
