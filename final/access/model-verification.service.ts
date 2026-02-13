import { v4 as uuid } from "uuid";
import { cloneDeep } from "lodash";
import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { IModelCommandsService } from "./model-commands.service";
import { TranslateService } from "../translate/translate.service";
import { IModelObjectProperty, ModelPropertiesService } from "./model-properties.service";
import { ISelectionService } from "src/app/common/services/selection/selection.service";
import { IModalViewService } from "../modal/imodal-view.service";
import { IUserService } from "../user/user.service";
import { MvcConst } from "../mvc/mvc.const";
import { IMvcService } from "../mvc/imvc.service";

/**
 * Interface of the service dedicated to verification
 */
export interface IModelVerificationService {
  loadVerificationData(data: any, projectName: string);
  initObjectSourceAndStateData(o: any): any;
  getVerificationDataToSave(): any;

  copyProperties(org: any, target: any): any;

  getObjectOrPropertyVerificationData(o: any): any;

  getObjectStateLabel(o: any): string;
  getVerificationDataPropertyValue(o: any, propertyName: string): any;
  getObjectIsToBeVerifiedValue(o: any): boolean;

  getObjectVerificationData(object: any): any;

  resetSelectedObjectsVerificationData();

  modifyVerificationDataViaForm(object: any, options?: { forcedData?: any; cb?: any });
  modifyFirstSelectedObjectVerificationDataViaForm(options?: { forcedData?: any });

  modifySelectedObjectsToBeVerifiedValue(value: any);
  modifyObjectsToBeVerifiedValue(objects: any[], value: any);

  modifyObjectsVerificationState(objects: any[], value: any, updateToBeVerified?: boolean);
  modifySelectedObjectsVerificationState(value: any, updateToBeVerified?: boolean);

  modifySelectedObjectsVerificationData(verificationData: any);
  modifyObjectsVerificationData(objects: any[], verificationData: any);

  getObjectVerificationPropertiesData(object: any): any[];

  modifySelectedObjectsPropertiesToBeVerifiedValue(value: any);
  modifyObjectsPropertiesToBeVerifiedValue(objects: any[], value: any);
  modifySelectedObjectsPropertiesVerificationData(verificationData: any);

  checkIfOnePropertyIsNOK(object: any): boolean;
  checkIfSelectedObjectsCanBeSetTOOK(): boolean;

  // Dirty tracking
  isDirty: boolean;
  setDirty(value: boolean): void;
  clearDirty(): void;

  // Auto-save settings
  isAutoSaveEnabled: boolean;
  autoSaveIntervalMinutes: number;
  setAutoSaveEnabled(value: boolean): void;
  setAutoSaveIntervalMinutes(value: number): void;
  loadAutoSaveSettings(): void;
  saveAutoSaveSettings(): void;
}

/**
 * Service dedicated to verification
 */
export class ModelVerificationService implements IModelVerificationService {
  /**
   * Verification properties
   */
  public static verificationProperties = {
    objectState: "objectState",

    verificationToBeVerified: "verificationToBeVerified",
    verificationState: "verificationState",
    verificationComment: "verificationComment",
    verificationCR: "verificationCR",
    verificationUser: "verificationUser",
    verificationDate: "verificationDate",
    verificationInputDocument: "verificationInputDocument",
    verificationDocument: "verificationDocument",
    verificationResponseState: "verificationResponseState",
    verificationResponseComment: "verificationResponseComment",
    verificationResponseUser: "verificationResponseUser",
    verificationResponseDate: "verificationResponseDate",
    verificationResponseCheck: "verificationResponseCheck",
    verificationCloseState: "verificationCloseState",
    verificationCorrectionState: "verificationCorrectionState",
    verificationCorrectionUser: "verificationCorrectionUser",
    verificationCorrectionDate: "verificationCorrectionDate",

    verificationRulesStateList: "verificationRulesStateList",
    verificationRulesState: "verificationRulesState",
    verificationOverallState: "verificationOverallState",
  };

  /**
   * Verification state values
   */
  public static verificationStateValues = {
    notVerified: "Not Verified",
    verifiedOK: "Verified OK",
    verifiedNOK: "Verified NOK",
  };

  /**
   * Verification response state values
   */
  public static verificationResponseStateValues = {
    noResponse: "No Response",
    responseStateOK: "Response OK",
    responseStateNOK: "Response NOK",
  };

  /**
   * Automatic comments when setting object verification status
   */
  private static comments = {
    objectStatusForcedToNOK: "verification.object.status.forced.nok",
    objectStatusSetToOK: "verification.object.status.set.ok",
  };

  private static LS_AUTO_SAVE_ENABLED = "alm-rvw-auto-save-enabled";
  private static LS_AUTO_SAVE_INTERVAL = "alm-rvw-auto-save-interval";

  private inputSourceAndStateData: any = {};
  private projectName: string;

  // Dirty tracking
  public isDirty = false;

  // Auto-save settings (persisted in localStorage)
  public isAutoSaveEnabled = false;
  public autoSaveIntervalMinutes = 5;

  // Used services
  private modelCommandsService: IModelCommandsService;
  private translateService: TranslateService;
  private modelPropertiesService: ModelPropertiesService;
  private selectionService: ISelectionService;
  private modalViewService: IModalViewService;
  private userService: IUserService;
  private mvcService: IMvcService;

  /**
   * Service constructor
   * @param servicesService Service that manages services
   */
  public constructor(public servicesService: IServicesService) {}

  /**
   * Initialization of the service
   */
  public initService() {
    this.modelCommandsService = this.servicesService.getService(
      ServicesConst.ModelCommandsService
    ) as IModelCommandsService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as TranslateService;
    this.modelPropertiesService = this.servicesService.getService(
      ServicesConst.ModelPropertiesService
    ) as ModelPropertiesService;
    this.selectionService = this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService;
    this.modalViewService = this.servicesService.getService(ServicesConst.ModalViewService) as IModalViewService;
    this.userService = this.servicesService.getService(ServicesConst.UserService) as IUserService;
    this.mvcService = this.servicesService.getService(ServicesConst.MvcService) as IMvcService;
    this.loadAutoSaveSettings();
  }

  // ─── Dirty Tracking ───────────────────────────────────────────────────

  /**
   * Set the dirty flag and emit an MVC message
   * @param value The dirty state
   */
  public setDirty(value: boolean): void {
    if (this.isDirty !== value) {
      this.isDirty = value;
      this.mvcService.emit({ type: MvcConst.MSG_VERIFICATION_DIRTY_CHANGED, isDirty: value });
    }
  }

  /**
   * Clear the dirty flag (e.g. after a successful save)
   */
  public clearDirty(): void {
    this.setDirty(false);
  }

  // ─── Auto-Save Settings (persisted in localStorage) ───────────────────

  /**
   * Enable or disable auto-save
   * @param value Whether auto-save is enabled
   */
  public setAutoSaveEnabled(value: boolean): void {
    this.isAutoSaveEnabled = value;
    this.saveAutoSaveSettings();
  }

  /**
   * Set the auto-save interval in minutes
   * @param value The interval in minutes (minimum 1)
   */
  public setAutoSaveIntervalMinutes(value: number): void {
    this.autoSaveIntervalMinutes = Math.max(1, value);
    this.saveAutoSaveSettings();
  }

  /**
   * Load auto-save settings from localStorage
   */
  public loadAutoSaveSettings(): void {
    try {
      const enabledStr = localStorage.getItem(ModelVerificationService.LS_AUTO_SAVE_ENABLED);
      const intervalStr = localStorage.getItem(ModelVerificationService.LS_AUTO_SAVE_INTERVAL);
      if (enabledStr !== null) {
        this.isAutoSaveEnabled = enabledStr === "true";
      }
      if (intervalStr !== null) {
        const parsed = parseInt(intervalStr, 10);
        if (!isNaN(parsed) && parsed >= 1) {
          this.autoSaveIntervalMinutes = parsed;
        }
      }
    } catch (e) {
      console.warn("[Verification] Could not load auto-save settings from localStorage", e);
    }
  }

  /**
   * Save auto-save settings to localStorage
   */
  public saveAutoSaveSettings(): void {
    try {
      localStorage.setItem(ModelVerificationService.LS_AUTO_SAVE_ENABLED, String(this.isAutoSaveEnabled));
      localStorage.setItem(ModelVerificationService.LS_AUTO_SAVE_INTERVAL, String(this.autoSaveIntervalMinutes));
    } catch (e) {
      console.warn("[Verification] Could not save auto-save settings to localStorage", e);
    }
  }

  /**
   * Load verification data from the server
   * @param data Verification data
   */
  public loadVerificationData(data: any, projectName: string) {
    console.log("[Verification] loadVerificationData called. projectName:", projectName, "data:", data);
    const projectData = data && data.find && data.find((p: any) => p.fileName === projectName + ".json");
    console.log("[Verification] projectData found:", !!projectData, "fileName searched:", projectName + ".json");
    if (projectData) {
      console.log("[Verification] projectData.content exists:", !!projectData.content,
        "elementTypes count:", projectData.content?.inputSourceAndState?.elementTypes?.length || 0);
    }
    this.inputSourceAndStateData =
      projectData && projectData.content
        ? projectData.content
        : {
            type: "inputSourceAndState",
            inputSourceAndState: {
              type: "inputSourceAndState",
              label: "inputSourceAndState",
              elementTypes: [],
            },
          };
    this.projectName = projectName;
    // Reset dirty flag when fresh data is loaded from server
    this.isDirty = false;
    console.log("[Verification] inputSourceAndStateData loaded. type:", this.inputSourceAndStateData?.type,
      "elementTypes count:", this.inputSourceAndStateData?.inputSourceAndState?.elementTypes?.length || 0);
    this.updateInputAndSourceAfterLoading();
  }

  /**
   * Update input and source compil statuses
   */
  public updateInputAndSourceAfterLoading() {
    const insrc = this.inputSourceAndStateData;
    if (insrc && insrc.inputSourceAndState && insrc.inputSourceAndState.elementTypes) {
      if (insrc.inputSourceAndState.elementTypes.forEach) {
        insrc.inputSourceAndState.elementTypes.forEach((elementType: any) => {
          if (elementType.elements) {
            if (!elementType.elements.forEach) {
              elementType.elements = [elementType.elements];
            }
            elementType.elements.forEach((element: any) => {
              const ev = element.elementVerification;
              if (ev) {
                this.updateComputedVerificationData(ev);
              }

              if (element.propertiesDescription) {
                if (!element.propertiesDescription.forEach) {
                  element.propertiesDescription = [element.propertiesDescription];
                }
                element.propertiesDescription.forEach((pd: any) => {
                  if (pd.propertyVerification && pd.propertyVerification.forEach) {
                    pd.propertyVerification = pd.propertyVerification.find((e: any) => true);
                  }
                  if (pd.propertyVerification) {
                    // DR: dor not take into account prop without prefix:
                    if (pd.propertyName && pd.propertyName.indexOf(":") > 0) {
                      // Debug logging for verification data loading
                      // if (pd.propertyName.includes("rail:")) {
                      //   console.log(`🔍 Verification Data Loading Debug:`, {
                      //     propertyName: pd.propertyName,
                      //     verificationState: pd.propertyVerification?.verificationState,
                      //     elementType: elementType?.elementType,
                      //     elementId: element?.id
                      //   });
                      // }
                      this.updateParentIfPropNOK(ev, pd.propertyVerification);
                      this.updateComputedVerificationData(pd.propertyVerification);
                    }
                  }
                });
              }
            });
          }
        });
      }
    }
  }

  /**
   * Update parent state to NOK if one prop is NOK
   * @param parentVerification Parent verification data
   * @param propertyVerification Property verification data
   */
  private updateParentIfPropNOK(parentVerification: any, propertyVerification: any) {
    if (
      parentVerification &&
      parentVerification.verificationState !== ModelVerificationService.verificationStateValues.verifiedNOK &&
      propertyVerification &&
      propertyVerification.verificationState === ModelVerificationService.verificationStateValues.verifiedNOK
    ) {
      parentVerification.verificationState = ModelVerificationService.verificationStateValues.verifiedNOK;
      parentVerification.verificationToBeVerified = true;
      if (!parentVerification.verificationComment) {
        parentVerification.verificationComment = this.translateService.translateFromMap(
          ModelVerificationService.comments.objectStatusSetToOK
        );
      }
      this.updateComputedVerificationData(parentVerification);
    }
  }

  /**
   * Update computed verification data
   * @param verification
   */
  private updateComputedVerificationData(verification: any) {
    if (verification) {
      // verificationRulesState
      if (verification.verificationRulesState) {
        verification.verificationRulesState = ModelVerificationService.verificationStateValues.notVerified;
      }
      if (verification.verificationRulesStateList && verification.verificationRulesStateList.length) {
        verification.verificationRulesState = verification.verificationRulesStateList.find(
          (vrst: any) => vrst.verificationRuleState === ModelVerificationService.verificationStateValues.verifiedNOK
        )
          ? ModelVerificationService.verificationStateValues.verifiedNOK
          : ModelVerificationService.verificationStateValues.verifiedOK;
      }

      // verificationOverallState
      if (verification.verificationOverallState) {
        verification.verificationOverallState = ModelVerificationService.verificationStateValues.notVerified;
      }
      if (
        verification.verificationState === ModelVerificationService.verificationStateValues.verifiedOK ||
        verification.verificationRulesState === ModelVerificationService.verificationStateValues.verifiedOK
      ) {
        verification.verificationOverallState = ModelVerificationService.verificationStateValues.verifiedOK;
      }
      if (
        verification.verificationState === ModelVerificationService.verificationStateValues.verifiedNOK ||
        verification.verificationRulesState === ModelVerificationService.verificationStateValues.verifiedNOK
      ) {
        verification.verificationOverallState = ModelVerificationService.verificationStateValues.verifiedNOK;
      }
    }
  }

  /**
   * Get data to save to inputSourceAndState file
   * @returns Data
   */
  public getVerificationDataToSave(): any {
    const elementTypes = this.inputSourceAndStateData?.inputSourceAndState?.elementTypes;
    let totalElements = 0;
    let totalProperties = 0;
    if (elementTypes && elementTypes.forEach) {
      elementTypes.forEach((et: any) => {
        if (et.elements && et.elements.forEach) {
          totalElements += et.elements.length;
          et.elements.forEach((el: any) => {
            if (el.propertiesDescription && el.propertiesDescription.forEach) {
              totalProperties += el.propertiesDescription.length;
            }
          });
        }
      });
    }
    console.log("[Verification] getVerificationDataToSave:",
      "projectName:", this.projectName,
      "fileName:", this.projectName + ".json",
      "elementTypes:", elementTypes?.length || 0,
      "totalElements:", totalElements,
      "totalProperties:", totalProperties,
      "inputSourceAndStateData ref:", !!this.inputSourceAndStateData);
    return { content: this.inputSourceAndStateData, fileName: this.projectName + ".json" };
  }

  /**
   * Init metaData: Search source and state data from input source and state file and attach it to metaData object
   * @param o Object
   */
  public initObjectSourceAndStateData(o: any): any {
    const snsd = this.getSourceAndStateDataFromObject(o);
    if (snsd) {
      o.metaData = snsd;
      console.log("[Verification] initObjectSourceAndStateData: metaData attached for object",
        o.type, o.id, "elementVerification:", !!snsd.elementVerification);
    }
    return o;
  }

  /**
   * Get input and source data linked to an object
   * @param o Object
   * @returns Source and state data of an object
   */
  protected getSourceAndStateDataFromObject(o: any): any {
    let res = null;
    try {
      if (
        o &&
        o.id &&
        o.type &&
        this.inputSourceAndStateData &&
        this.inputSourceAndStateData[this.inputSourceAndStateData.type]
      ) {
        const testType = o.type.split(":").pop();
        const isas = this.inputSourceAndStateData[this.inputSourceAndStateData.type];
        if (isas.elementTypes && isas.elementTypes.find) {
          const elementTypes = this.inputSourceAndStateData[this.inputSourceAndStateData.type].elementTypes.find(
            (et: any) => et.elementType === testType
          );
          if (elementTypes && elementTypes.elements && elementTypes.elements.find) {
            res = elementTypes.elements.find((e: any) => e.idRef === o.id);
          }
        }
      }
    } catch (ex) {
      console.error(ex);
    }
    return res;
  }

  /**
   * Get object or property metadata
   * @param o Object
   * @returns Metadata
   */
  private getObjectOrPropertyMetaData(o: any): any {
    if (o) {
      // Is it a property ?
      if (o.property) {
        // Get propertyDescription object
        return this.getPropertyDescription(o.object, o.property.nameWithPrefix);
      }
      // Lazy initialization: if metaData is not yet attached (e.g. verification data was loaded
      // after initObjectSourceAndStateData ran during project load), try to find it now.
      if (!o.metaData) {
        this.initObjectSourceAndStateData(o);
      }
      // Return metadata attached to the object
      if (o.metaData && !o.metaData.elementVerification) {
        o.metaData.elementVerification = this.getInitVerificationData();
      }
      return o.metaData;
    }
    return null;
  }

  /**
   * Get verification data of an object or a property from metaData
   * @param o Object or object property
   * @returns Verification data (elementVerifiction or propertyVerification)
   */
  public getObjectOrPropertyVerificationData(o: any): any {
    const md = this.getObjectOrPropertyMetaData(o);
    return this.getVerificationDataFromMetaData(md);
  }

  /**
   * Get verification data from meta data (elementVerification for an objet or propertyVerification for a property)
   * @param md Meta data of an object
   * @returns The verification data object
   */
  public getVerificationDataFromMetaData(md: any): any {
    return md ? (md.elementVerification ? md.elementVerification : md.propertyVerification) : null;
  }

  /**
   * Get metadata or create it if undefined for an object or an object property
   * @param o Object or object property
   * @returns The metaData
   */
  private getOrCreateObjectOrPropertyMetaData(o: any): any {
    return o && o.property ? this.getOrCreatePropertyDescription(o) : this.getOrCreateObjectMetaData(o);
  }

  /**
   * Get object metadata or create it if undefined
   * @param o Object
   * @returns Metadata
   */
  public getOrCreateObjectMetaData(o: any): any {
    let res = this.getObjectOrPropertyMetaData(o);
    if (o && !res) {
      o.metaData = {
        id: uuid(),
        idRef: o.id,
        // label: "elements",
        lockState: "Unlock",
        nameRef: o.label,
        objectState: "Draft",
        // type: "elements",
        xmlType: "elements",
        elementVerification: this.getInitVerificationData(),
        propertiesDescription: [],
      };
      res = o.metaData;
      this.addObjectMetaDadaToInputSourceAndStateData(o);
    }
    return res;
  }

  /**
   * Add meta data to inputSourceAndState
   * @param o Object
   */
  public addObjectMetaDadaToInputSourceAndStateData(o: any) {
    if (
      o &&
      o.id &&
      o.type &&
      this.inputSourceAndStateData &&
      this.inputSourceAndStateData[this.inputSourceAndStateData.type] &&
      o.metaData
    ) {
      const testType = o.type.split(":").pop();
      let elementTypes = this.inputSourceAndStateData[this.inputSourceAndStateData.type].elementTypes.find(
        (et: any) => et.elementType === testType
      );
      if (!elementTypes) {
        elementTypes = {
          type: "elementTypes",
          label: "elementTypes",
          elementType: testType,
          xmlType: "elementTypes",
          id: uuid(),
          elements: [],
        };
        this.inputSourceAndStateData[this.inputSourceAndStateData.type].elementTypes.push(elementTypes);
      }
      if (elementTypes) {
        if (elementTypes.elements) {
          if (!elementTypes.elements.push) {
            const tmp = cloneDeep(elementTypes.elements);
            elementTypes.elements = [tmp];
          }
        } else {
          elementTypes.elements = [];
        }
        elementTypes.elements.push(o.metaData);
      }
    }
  }

  /**
   * Get or create property description for a property
   * @param o The property
   * @returns The property description
   */
  public getOrCreatePropertyDescription(o: any): any {
    let pd = null;
    const md = this.getOrCreateObjectMetaData(o ? o.object : null);
    if (md && o.property && o.property.nameWithPrefix) {
      if (!md.propertiesDescription) {
        md.propertiesDescription = [];
      }
      pd = md.propertiesDescription.find((pd1: any) => pd1.propertyName === o.property.nameWithPrefix);
      if (!pd) {
        pd = {
          type: "propertiesDescription",
          label: "propertiesDescription",
          id: uuid(),
          propertyName: o.property.nameWithPrefix,
          xmlType: "propertiesDescription",
          propertyVerification: this.getInitVerificationData(),
        };
        md.propertiesDescription.push(pd);
      }
    }
    return pd;
  }

  /**
   * Get properties descritpion of an object
   * @param o The object
   * @returns The properties descriptions if exists, [] if not
   */
  private getPropertiesDescription(o: any): any {
    const md = this.getObjectOrPropertyMetaData(o);
    return md && md.propertiesDescription ? md.propertiesDescription : [];
  }

  /**
   * Get the property description of the property of an object
   * @param o The object
   * @param propertyName The property name
   * @returns The property description, undefined if not
   */
  private getPropertyDescription(o: any, propertyName: string): any {
    const propertiesDescription = this.getPropertiesDescription(o);
    const res = propertiesDescription.find((pd1: any) => pd1.propertyName === propertyName);
    
    // Debug logging for property lookup
    // if (propertyName && propertyName.includes("rail:")) {
    //   console.log(`🔍 Property Lookup Debug:`, {
    //     propertyName: propertyName,
    //     found: !!res,
    //     availableProperties: propertiesDescription.map((pd: any) => pd.propertyName),
    //     objectType: o?.type,
    //     objectId: o?.id
    //   });
    // }
    
    return res;
  }

  /**
   * Get the translated value of a verification data property
   * @param o The object
   * @param propertyName The verification data property name
   * @returns The translated value
   */
  private getObjectVerificationDataTranslatedValue(o: any, propertyName: string): string {
    const v = this.getVerificationDataPropertyText(o, propertyName);
    return v ? this.modelPropertiesService.capitalize(this.translateService.translateFromMap(v)) : "";
  }

  /**
   * Get the object state value of an object
   * @param o The object
   * @returns The translated value of the object state, "" if not defined
   */
  public getObjectStateLabel(o: any): string {
    return this.getObjectVerificationDataTranslatedValue(
      o,
      ModelVerificationService.verificationProperties.objectState
    );
  }

  /**
   * Get the value of a property of the verification data of an object
   * @param o The object
   * @param propertyName The property name
   * @returns The value, undefined if not defined
   */
  public getVerificationDataPropertyValue(o: any, propertyName: string): any {
    const vd = this.getObjectOrPropertyVerificationData(o);
    return vd ? vd[propertyName] : undefined;
  }

  /**
   * Get the text value of a property of the verification data of an object
   * @param o The object
   * @param propertyName The property name
   * @param label The prefix
   * @returns The text value
   */
  private getVerificationDataPropertyText(o: any, propertyName: string, label: string = ""): string {
    let res = this.getVerificationDataPropertyValue(o, propertyName);
    label = label !== null ? label : propertyName;
    res = res && label !== "" ? (res = label + res + " ") : res;
    return res;
  }

  /**
   * Get the is to be verified boolean value of an object
   * @param o The object
   * @returns The boolean value
   */
  public getObjectIsToBeVerifiedValue(o: any): boolean {
    return this.getVerificationDataPropertyValue(
      o,
      ModelVerificationService.verificationProperties.verificationToBeVerified
    );
  }

  /**
   * Get the defaut values of a verification data object
   * @returns A verification data object
   */
  public getInitVerificationData() {
    return {
      verificationToBeVerified: false,
      verificationState: ModelVerificationService.verificationStateValues.notVerified,
      verificationComment: "",
      verificationCR: "",
      verificationUser: null,
      verificationDate: null,

      verificationInputDocument: "",
      verificationDocument: "",

      verificationResponseState: "No Response",
      verificationResponseComment: "",
      verificationResponseUser: null,
      verificationResponseDate: null,

      verificationResponseCheck: "",

      verificationCloseState: false,

      verificationCorrectionState: false,
      verificationCorrectionUser: null,
      verificationCorrectionDate: null,

      verificationRulesStateList: [],
      verificationRulesState: ModelVerificationService.verificationStateValues.notVerified,
      verificationOverallState: ModelVerificationService.verificationStateValues.notVerified,
    };
  }

  /**
   * Copy properties from an object to another one
   * @param org The origin object
   * @param target The target
   * @returns The target with copied properties
   */
  public copyProperties(org: any, target: any): any {
    if (org && target) {
      for (const propertyName in org) {
        if (org[propertyName]) {
          target[propertyName] = org[propertyName];
        }
      }
    }
    return target;
  }

  /**
   * Modify the verification data of an object
   * @param object The object
   * @param options The options (forceData, callback after settings)
   */
  public modifyVerificationDataViaForm(object: any, options: { forcedData?: any; cb?: any } = {}) {
    if (object) {
      const params = {
        formData: this.getInitVerificationData(),
        object,
      };
      const verificationData = this.getObjectVerificationData(object);
      this.copyProperties(verificationData, params.formData);

      if (options && options.forcedData) {
        this.copyProperties(options.forcedData, params.formData);
      }

      this.modalViewService.openVerificationModalComponent(params, (result: any) => {
        this.setObjectVerificationDataFromFormData(object, params.formData);
        if (options && options.cb) {
          options.cb(object);
        }
      });
    }
  }

  /**
   * Get object verification data
   * @param object The object
   * @returns Get verification object data, with default values if not already defined
   */
  public getObjectVerificationData(object: any): any {
    const res = this.getInitVerificationData();
    const vd = this.getObjectOrPropertyVerificationData(object);
    if (vd) {
      this.copyProperties(vd, res);
    }
    return res;
  }

  /**
   * Set verification data from data of a form
   * @param object The object
   * @param formData The data of a form
   */
  private setObjectVerificationDataFromFormData(object: any, formData: any) {
    const verificationData: any = this.getInitVerificationData();
    verificationData.verificationToBeVerified = true;
    this.copyProperties(formData, verificationData);
    this.setObjectsVerificationData([object], verificationData);
  }

  /**
   * Set verification data to a list of objects
   * @param objects The objects
   * @param verificationData The verification data
   */
  public setObjectsVerificationData(objects: any[], verificationData: any) {
    this.modifyObjectsVerificationData(objects, verificationData);
  }

  /**
   * Resets the verification data of the selected objects
   */
  public resetSelectedObjectsVerificationData() {
    this.resetObjectsVerificationData(this.selectionService.getSelectedObjects());
  }

  /**
   * Resets the verification data of a list of objects
   * @param objects The objects
   */
  private resetObjectsVerificationData(objects: any[]) {
    this.modifyObjectsVerificationData(objects, this.getInitVerificationData(), true, false);
  }

  /**
   * Get current user name
   * @returns String value, "" if no user
   */
  public getCurrentUserName(): string {
    const currentUser = this.userService.getCurrentUser();
    return currentUser ? currentUser.name || currentUser.userName : "";
  }

  /**
   * Verification values modifications via command
   * @param objects List of objects
   * @param verificationData Verification data
   * @param forceData Apply all modifications
   * @param updateUser Update user data or not
   */
  public modifyObjectsVerificationData(objects: any[], verificationData: any, forceData = false, updateUser = true) {
    if (verificationData && objects && objects.forEach) {
      console.log("[Verification] modifyObjectsVerificationData:",
        "objectCount:", objects.length,
        "verificationState:", verificationData?.verificationState,
        "toBeVerified:", verificationData?.verificationToBeVerified,
        "objects:", objects.map((o: any) => o?.property?.nameWithPrefix || o?.type || "unknown"));
      const dataList: { object: any; propertyName: string; value: any }[] = [];
      objects.forEach((object: any) => {
        const md = this.getOrCreateObjectOrPropertyMetaData(object);
        const vd = this.getVerificationDataFromMetaData(md);
        if (vd) {
          // Set user & date metadatas
          if (updateUser) {
            if (
              (verificationData[ModelVerificationService.verificationProperties.verificationState] !== undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationState] !==
                  vd[ModelVerificationService.verificationProperties.verificationState]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationComment] !== undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationComment] !==
                  vd[ModelVerificationService.verificationProperties.verificationComment]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationCR] !== undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationCR] !==
                  vd[ModelVerificationService.verificationProperties.verificationCR]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationInputDocument] !==
                undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationInputDocument] !==
                  vd[ModelVerificationService.verificationProperties.verificationInputDocument]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationResponseCheck] !==
                undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationResponseCheck] !==
                  vd[ModelVerificationService.verificationProperties.verificationResponseCheck])
            ) {
              verificationData.verificationUser = this.getCurrentUserName();
              verificationData.verificationDate = Date.now();
            }
            if (
              (verificationData[ModelVerificationService.verificationProperties.verificationResponseState] !==
                undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationResponseState] !==
                  vd[ModelVerificationService.verificationProperties.verificationResponseState]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationResponseComment] !==
                undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationResponseComment] !==
                  vd[ModelVerificationService.verificationProperties.verificationResponseComment]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationCR] !== undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationCR] !==
                  vd[ModelVerificationService.verificationProperties.verificationInputDocument]) ||
              (verificationData[ModelVerificationService.verificationProperties.verificationInputDocument] !==
                undefined &&
                verificationData[ModelVerificationService.verificationProperties.verificationInputDocument] !==
                  vd[ModelVerificationService.verificationProperties.verificationInputDocument])
            ) {
              verificationData.verificationResponseUser = this.getCurrentUserName();
              verificationData.verificationResponseDate = Date.now();
            }
            if (
              verificationData[ModelVerificationService.verificationProperties.verificationCorrectionState] !==
                undefined &&
              verificationData[ModelVerificationService.verificationProperties.verificationCorrectionState] !==
                vd[ModelVerificationService.verificationProperties.verificationCorrectionState]
            ) {
              verificationData.verificationCorrectionUser = this.getCurrentUserName();
              verificationData.verificationCorrectionDate = Date.now();
            }
          }

          this.applyPropertyVerificationRules(verificationData, object);
          this.updateComputedVerificationData(verificationData);

          // Get update data list
          this.testPropertiesAndAddToDataList(
            verificationData,
            vd,
            [
              ModelVerificationService.verificationProperties.verificationToBeVerified,
              ModelVerificationService.verificationProperties.verificationState,
              ModelVerificationService.verificationProperties.verificationComment,
              ModelVerificationService.verificationProperties.verificationCR,
              ModelVerificationService.verificationProperties.verificationUser,
              ModelVerificationService.verificationProperties.verificationDate,
              ModelVerificationService.verificationProperties.verificationInputDocument,
              ModelVerificationService.verificationProperties.verificationDocument,
              ModelVerificationService.verificationProperties.verificationResponseState,
              ModelVerificationService.verificationProperties.verificationResponseComment,
              ModelVerificationService.verificationProperties.verificationResponseUser,
              ModelVerificationService.verificationProperties.verificationResponseDate,
              ModelVerificationService.verificationProperties.verificationResponseCheck,
              ModelVerificationService.verificationProperties.verificationCloseState,
              ModelVerificationService.verificationProperties.verificationCorrectionState,
              ModelVerificationService.verificationProperties.verificationCorrectionUser,
              ModelVerificationService.verificationProperties.verificationCorrectionDate,
              ModelVerificationService.verificationProperties.verificationRulesStateList,

              ModelVerificationService.verificationProperties.verificationRulesState,
              ModelVerificationService.verificationProperties.verificationOverallState,
            ],
            dataList,
            forceData
          );
        }
      });
      this.modelCommandsService.modifyObjectsWithDataList(dataList);

      // Mark as dirty (unsaved changes)
      this.setDirty(true);

      // Emit Mvc message (used for mobile dirty flag)
      this.mvcService.emit({ type: MvcConst.MSG_VERIFICATION_CHANGED });
    }
  }

  /**
   * Apply verification rules (if obe prop verif state is nok, force the object verif state to nok, etc...)
   * @param verificationData
   * @param object
   */
  private applyPropertyVerificationRules(verificationData: any, object: any) {
    if (object.type === "objectProperty") {
      const parentObject = object.object;

      // If prop verif state is nok => force parent object verif state to nok
      if (
        verificationData[ModelVerificationService.verificationProperties.verificationState] ===
        ModelVerificationService.verificationStateValues.verifiedNOK
      ) {
        this.testAndSetObjectNOK(parentObject);
      }

      // If all prop verif state are ok => force parent object verif state to ok
      else if (
        verificationData[ModelVerificationService.verificationProperties.verificationState] ===
        ModelVerificationService.verificationStateValues.verifiedOK
      ) {
        const allPropOK = this.checkIfAllPropertiesAreOK(parentObject, object.propertyName);
        if (allPropOK) {
          this.testAndSetObjectOK(parentObject);
        }
      }
    }
  }

  /**
   * Test an object if it is not ok and set it to ok
   * @param parentObject
   */
  private testAndSetObjectOK(parentObject: any) {
    if (parentObject) {
      const mdParentObject = this.getOrCreateObjectOrPropertyMetaData(parentObject);
      const vdParentObject = this.getVerificationDataFromMetaData(mdParentObject);
      if (
        vdParentObject[ModelVerificationService.verificationProperties.verificationState] !==
        ModelVerificationService.verificationStateValues.verifiedOK
      ) {
        const vdParentObjectSetToOK: any = this.getInitVerificationData();
        this.copyProperties(vdParentObject, vdParentObjectSetToOK);
        vdParentObjectSetToOK.verificationToBeVerified = true;
        vdParentObjectSetToOK.verificationState = ModelVerificationService.verificationStateValues.verifiedOK;
        if (!vdParentObjectSetToOK.verificationComment) {
          vdParentObjectSetToOK.verificationComment = this.translateService.translateFromMap(
            ModelVerificationService.comments.objectStatusSetToOK
          );
        }
        this.setObjectsVerificationData([parentObject], vdParentObjectSetToOK);
      }
    }
  }

  /**
   * Test an object if it is not ok and set it to nok when a prop is nok
   * @param parentObject
   */
  private testAndSetObjectNOK(parentObject: any) {
    if (parentObject) {
      const mdParentObject = this.getOrCreateObjectOrPropertyMetaData(parentObject);
      const vdParentObject = this.getVerificationDataFromMetaData(mdParentObject);
      if (
        vdParentObject[ModelVerificationService.verificationProperties.verificationState] !==
        ModelVerificationService.verificationStateValues.verifiedNOK
      ) {
        const vdParentObjectForcedNOK: any = this.getInitVerificationData();
        this.copyProperties(vdParentObject, vdParentObjectForcedNOK);
        vdParentObjectForcedNOK.verificationToBeVerified = true;
        vdParentObjectForcedNOK.verificationState = ModelVerificationService.verificationStateValues.verifiedNOK;
        if (!vdParentObjectForcedNOK.verificationComment) {
          vdParentObjectForcedNOK.verificationComment = this.translateService.translateFromMap(
            ModelVerificationService.comments.objectStatusForcedToNOK
          );
        }
        this.setObjectsVerificationData([parentObject], vdParentObjectForcedNOK);
      }
    }
  }

  /**
   * Tests properties and add to a data list
   * @param verificationData Verification data
   * @param vd Target verification data
   * @param propertyNameList List of property names
   * @param dataList Data list
   * @param forceData Force data
   */
  private testPropertiesAndAddToDataList(
    verificationData: any,
    vd: any,
    propertyNameList: string[],
    dataList: any[],
    forceData = false
  ) {
    propertyNameList.forEach((pn: string) =>
      this.testPropertyAndAddToDataList(verificationData, vd, pn, dataList, forceData)
    );
  }

  /**
   * Test a property and add it to data list if property is set
   * @param verificationData Verification data
   * @param vd Target verification data
   * @param propertyNameList List of property names
   * @param dataList Data list
   * @param forceData Force data
   */
  private testPropertyAndAddToDataList(
    verificationData: any,
    vd: any,
    propertyName: string,
    dataList: any[],
    forceData = false
  ) {
    if ((verificationData && dataList && verificationData[propertyName] !== undefined) || forceData) {
      dataList.push({ object: vd, propertyName, value: verificationData[propertyName] });
    }
  }

  /**
   * Modifies verification data of the selected objects
   * @param verificationData
   */
  public modifySelectedObjectsVerificationData(verificationData: any) {
    this.modifyObjectsVerificationData(this.selectionService.getSelectedObjects(), verificationData);
  }

  /**
   * Modifies the tobeverified value of objects
   * @param objects The objects
   * @param value The value to set
   */
  public modifyObjectsToBeVerifiedValue(objects: any[], value: any) {
    this.modifyObjectsVerificationData(objects, { verificationToBeVerified: value });
  }

  /**
   * Modifies the tobeverified value of the selected objects
   * @param value The value to set
   */
  public modifySelectedObjectsToBeVerifiedValue(value: any) {
    this.modifySelectedObjectsVerificationData({ verificationToBeVerified: value });
  }

  /**
   * Modifies the verification state of a list of objects
   * @param objects The objects
   * @param value The value
   * @param updateToBeVerified Automatically updates toBeVerified or not
   */
  public modifyObjectsVerificationState(objects: any[], value: any, updateToBeVerified: boolean = true) {
    const verificationData: any = { verificationState: value };
    if (updateToBeVerified) {
      verificationData.verificationToBeVerified = true;
    }
    this.modifyObjectsVerificationData(objects, verificationData);
  }

  /**
   * Modifies the verification state of the selected objects
   * @param value The value
   * @param updateToBeVerified Automatically updates toBeVerified or not
   */
  public modifySelectedObjectsVerificationState(value: any, updateToBeVerified: boolean = true) {
    this.modifyObjectsVerificationState(this.selectionService.getSelectedObjects(), value, updateToBeVerified);
  }

  /**
   * Modifies the verification data via form of the first selected object
   * @param options Options (force data)
   */
  public modifyFirstSelectedObjectVerificationDataViaForm(options: { forcedData?: any } = {}) {
    this.modifyVerificationDataViaForm(
      this.selectionService.getSelectedObjects().find((o) => true),
      options
    );
  }

  /**
   * Get object properties to be verified
   * @param object The object
   * @param isUndefinedValueVisible Undefined value filter
   * @returns The list of properties of the object
   */
  public getObjectVerificationPropertiesData(object: any, isUndefinedValueVisible = false): any[] {
    const res = [];
    if (object) {
      const excludedProperties = ["id", "type", "xmlType", "metaData"];
      let properties = this.modelPropertiesService.getObjectProperties(object, excludedProperties, {
        isUndefinedValueVisible,
      });
      properties = properties.sort(this.modelPropertiesService.sortFunctions.displayedNameSortFunction);

      properties.forEach((property: IModelObjectProperty) => {
        // Debug logging for property data creation
        // if (property.nameWithPrefix && property.nameWithPrefix.includes("rail:")) {
        //   console.log(`🔍 Property Data Creation Debug:`, {
        //     displayedName: property.displayedName,
        //     nameWithPrefix: property.nameWithPrefix,
        //     propertyName: property.nameWithPrefix,
        //     propertyPrefix: property.xsdPrefix
        //   });
        // }
        
        const propertyData = {
          type: "objectProperty",
          object,
          property,
          propertyName: property.nameWithPrefix, // Use nameWithPrefix instead of displayedName
          propertyPrefix: property.xsdPrefix,
        };
        res.push(propertyData);
      });
    }
    return res;
  }

  /**
   * Check if selected objects can be set to NOK (not if one has a prop set to nok)
   * @returns
   */
  public checkIfSelectedObjectsCanBeSetTOOK(): boolean {
    const selectedObjects = this.selectionService.getSelectedObjects();
    if (selectedObjects.length === 0) {
      return false;
    }
    const oneNOK = selectedObjects.find((o: any) => this.checkIfOnePropertyIsNOK(o));
    return oneNOK === undefined;
  }

  /**
   * Checks if one property is verified NOK
   * @param object The object
   * @returns Boolean
   */
  public checkIfOnePropertyIsNOK(object: any): boolean {
    if (!object || object.type === "objectProperty") {
      return false;
    }
    const propertyDataList = this.getObjectVerificationPropertiesData(object, false);
    const propertyNOK = propertyDataList.find((propertyData: any) => {
      const vd = this.getObjectOrPropertyVerificationData(propertyData);
      return vd && vd.verificationState === ModelVerificationService.verificationStateValues.verifiedNOK;
    });
    return propertyNOK !== undefined;
  }

  /**
   * Checks if all properties are verified OK
   * @param object The object
   * @returns Boolean
   */
  public checkIfAllPropertiesAreOK(object: any, excludedProperty: string): boolean {
    const propertyDataList = this.getObjectVerificationPropertiesData(object, false);
    const propertyNOK = propertyDataList.find((propertyData: any) => {
      const vd = this.getObjectOrPropertyVerificationData(propertyData);
      return (
        !["isSelected", excludedProperty].includes(propertyData.propertyName) &&
        (!vd || vd.verificationState !== ModelVerificationService.verificationStateValues.verifiedOK)
      );
    });
    return propertyNOK === undefined;
  }

  /**
   * Modifies the toBeVerified value of the selected objects
   * @param value The value
   */
  public modifySelectedObjectsPropertiesToBeVerifiedValue(value: any) {
    this.modifySelectedObjectsPropertiesVerificationData({ verificationToBeVerified: value });
  }

  /**
   * Modifies the verifiction data of the selected objects properties
   * @param verificationData The verification data
   */
  public modifySelectedObjectsPropertiesVerificationData(verificationData: any) {
    this.modifyObjectsPropertiesVerificationData(this.selectionService.getSelectedObjects(), verificationData);
  }

  /**
   * Modifies the toBeVerified value of a list of objects
   * @param objects The objects
   * @param value The value
   */
  public modifyObjectsPropertiesToBeVerifiedValue(objects: any[], value: any) {
    this.modifyObjectsPropertiesVerificationData(objects, { verificationToBeVerified: value });
  }

  /**
   * Modifies the verification dta of objects
   * @param objects The objects
   * @param verificationData The verification data
   * @param forceData Force data or not
   * @param updateUser Update user or not
   */
  public modifyObjectsPropertiesVerificationData(
    objects: any[],
    verificationData: any,
    forceData = false,
    updateUser = true
  ) {
    if (verificationData && objects && objects.forEach) {
      objects.forEach((o: any) => {
        this.modifyObjectPropertiesVerificationData(o, verificationData, forceData, updateUser);
      });
    }
  }

  /**
   * Modifies the verification dta of an object
   * @param object The object
   * @param verificationData The verification data
   * @param forceData Force data or not
   * @param updateUser Update user or not
   */
  public modifyObjectPropertiesVerificationData(
    object: any[],
    verificationData: any,
    forceData = false,
    updateUser = true
  ) {
    const propertyDataList = this.getObjectVerificationPropertiesData(object);
    this.modifyObjectsVerificationData(propertyDataList, verificationData, forceData, updateUser);
  }
}
