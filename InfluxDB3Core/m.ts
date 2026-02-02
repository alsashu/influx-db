// import { cloneDeep } from "lodash";
import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { ModelService } from "./model.service";
import { IMetaModelService } from "../meta/meta-model.service";
import { ITranslateService } from "../translate/translate.service";
import { IGraphicConfigService } from "../config/graphic-config.service";
import { CompareService, ICompareService } from "../compare/compare.service";

/**
 * Interface of an object describing an object property
 */
export interface IModelObjectProperty {
  object: any;
  name: string;
  displayedName: string;
  value: any;
  displayedValue: string;
  type: string;
  xsdType: string;
  xsdPrefix: string;
  nameWithPrefix: string;
  displayedValueOld: string;
  // Hierarchy support for nested properties
  depth?: number;
  isHeader?: boolean;
  parentPath?: string;
  isCollapsed?: boolean;
  childCount?: number;
  sortKey?: string; // Used to maintain hierarchy during sorting
}

export interface IModelPropertiesService {
  sortFunctions: any;
  getObjectProperties(object: any, excludedProperties?: string[], options?: any): IModelObjectProperty[];
  mergeProperties(properties: IModelObjectProperty[], newProperties: IModelObjectProperty[]);
  findProperty(properties: IModelObjectProperty[], name: string);
  getValueType(object: any, propertyName: string): string;
  getDisplayedValue(object: any, propertyName: string): string;
  isValueBoolean(value: any): boolean;
  isValueNumber(value: any): boolean;
  getObjectTypeLabel(o: any): string;
  getTypeLabel(type: string): string;
  getPropertyText(o: any, propertyName: string, label?: string): string;
  toggleBooleanProperty(property: IModelObjectProperty);
  getBooleanDisplayedValue(value: any): string;
  capitalize(s: string): string;
  getIntValue(value: any): number;
  getFloatValue(value: any): number;
}

/**
 * Service calculation the properties of an object or a list of objects
 */
export class ModelPropertiesService implements IModelPropertiesService {
  private modelService: ModelService;
  private translateService: ITranslateService;
  private metaModelService: IMetaModelService;
  private graphicConfigService: IGraphicConfigService;
  private compareService: ICompareService;

  // TODO units
  private propertiesUnitsMap = new Map([["pos", { label: "m" }]]);

  public sortFunctions = {
    displayedNameSortFunction: (p1: any, p2: any) => {
      const v1 = p1 ? String(p1.displayedName).toUpperCase() : "";
      const v2 = p2 ? String(p2.displayedName).toUpperCase() : "";
      return v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
    },
  };

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(private servicesService: IServicesService) {}

  /**
   * Init the service
   */
  public initService() {
    this.modelService = this.servicesService.getService(ServicesConst.ModelService) as ModelService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.metaModelService = this.servicesService.getService(ServicesConst.MetaModelService) as IMetaModelService;
    this.graphicConfigService = this.servicesService.getService(
      ServicesConst.GraphicConfigService
    ) as IGraphicConfigService;
    this.compareService = this.servicesService.getService(ServicesConst.CompareService) as ICompareService;
  }

  /**
   * Get the model config
   * @returns The model config
   */
  private getModelConfig(): any {
    return this.modelService.getModelConfig();
  }

  /**
   * Counter for maintaining property extraction order
   */
  private propertySequenceCounter: number = 0;

  /**
   * Get the properties of an object
   * @param object The object
   * @param excludedProperties The list of excluded properties
   * @param options The options
   * @returns The list of properties
   */
  public getObjectProperties(
    object: any,
    excludedProperties: string[] = null,
    options: any = {
      getMetaData: false,
      isUndefinedValueVisible: true,
      calcRedAndYellowOldValue: true,
      getAdditionalInfos: false,
    }
  ): IModelObjectProperty[] {
    let properties: IModelObjectProperty[] = [];

    // Reset sequence counter for each top-level call
    this.propertySequenceCounter = 0;

    // Get object properties
    const modelConfig = this.getModelConfig();
    excludedProperties = excludedProperties || modelConfig.excludedProperties;

    // TODO: use graphicsconf.json to exclude properties for which visible = no
    excludedProperties = excludedProperties.concat(this.graphicConfigService.getHiddenProperties(object));
    properties = properties.concat(this.calculateObjectProperties(object, excludedProperties, options));

    // Add additional infos properties
    if (options && options.getAdditionalInfos) {
      const additionalInfosProperties = this.getPropertiesFromAdditionalInfos(object, excludedProperties, options);
      if (additionalInfosProperties.length) {
        // const debug = 1;
      }
      properties = properties.concat(additionalInfosProperties);
    }
    return properties;
  }

  /**
   * Get addtional infos objects properties of an object
   * @param object The object
   * @param excludedProperties The excluded properties
   * @param options The options
   * @returns The list of properties
   */
  private getPropertiesFromAdditionalInfos(
    object: any,
    excludedProperties: string[] = null,
    options: any = { getMetaData: false, isUndefinedValueVisible: true, calcRedAndYellowOldValue: true }
  ): any[] {
    let properties: IModelObjectProperty[] = [];
    if (object && object.type) {
      const additionInfosList = object.additionInfosList;
      if (additionInfosList && additionInfosList.forEach) {
        // Only exclude basic metadata properties, not the actual data properties
        const localExcludedProperties = (excludedProperties || []).concat("label", "ref", "id", "type", "xmlType");
        
        additionInfosList.forEach((additionInfosObject: any) => {
          // Process the additional info object properties
          const additionalProperties = this.calculateObjectProperties(additionInfosObject, localExcludedProperties, options);
          
          // Also process any nested object properties that might have xmlValue
          for (const propName in additionInfosObject) {
            if (!localExcludedProperties.includes(propName) && 
                typeof additionInfosObject[propName] === "object" && 
                additionInfosObject[propName] !== null) {
              
              const nestedObj = additionInfosObject[propName];
              if (nestedObj.xmlValue !== undefined) {
                // Create a property for nested objects with xmlValue
                const property: IModelObjectProperty = {
                  object: additionInfosObject,
                  name: propName.split(":").pop() || propName, // Remove namespace prefix
                  displayedName: this.translateService.translateModelPropertyName(propName.split(":").pop() || propName),
                  value: nestedObj.xmlValue,
                  displayedValue: nestedObj.xmlValue,
                  type: this.getValueType(nestedObj, "xmlValue"),
                  xsdType: nestedObj.type || "",
                  xsdPrefix: propName.includes(":") ? propName.split(":")[0] : "",
                  nameWithPrefix: propName,
                  displayedValueOld: null,
                };
                properties.push(property);
              }
            }
          }
          
          properties = properties.concat(additionalProperties);
        });
      }
    }
    
    return properties;
  }

  /**
   * Get the properties of an additional infos object
   * @param object The object
   * @param excludedProperties The excluded properties
   * @param options The options
   * @returns The list of properties
   */
  private calculateObjectProperties(
    object: any,
    excludedProperties: string[] = [],
    options: any = { getMetaData: false, isUndefinedValueVisible: true, calcRedAndYellowOldValue: true },
    depth: number = 0,
    parentPath: string = ""
  ): any[] {
    let properties: IModelObjectProperty[] = [];

    try {
      const propertyNames = [];

      // tslint:disable-next-line: forin
      for (const propertyName in object) {
        propertyNames.push(propertyName);
      }

      const attributeList = this.metaModelService.getAttributesForType(object.type);
      try {
        if (attributeList && attributeList.forEach) {
          attributeList.forEach((attribute: any) => {
            if (attribute.name !== undefined && propertyNames.indexOf(attribute.name) === -1) {
              propertyNames.push(attribute.name);
            }
          });
        }
      } catch (ex) {}

      if (propertyNames.indexOf("label") > -1 && propertyNames.indexOf("name") > -1) {
        propertyNames.splice(propertyNames.indexOf("label"), 1);
      }

      // Comparison data
      let modifiedObjectData = null;
      let objectOld = null;
      if (options.calcRedAndYellowOldValue) {
        const compareMap = this.compareService.getCompareObjectsDataMap(object);
        if (compareMap && compareMap.dataPerVersionList && compareMap.dataPerVersionList.length === 2) {
          // console.log(compareMap);
          const dataNewVersion = compareMap.dataPerVersionList[1];
          if (dataNewVersion && dataNewVersion.compareState === CompareService.CompareState.modified) {
            modifiedObjectData = dataNewVersion;
            const dataOldVersion = compareMap.dataPerVersionList[0];
            objectOld = dataOldVersion ? dataOldVersion.object : null;
          }
        }
      }

      propertyNames.forEach((propertyName: string) => {
        const theValue = object[propertyName];
        const isExcluded = excludedProperties.includes(propertyName);
        const isObject = typeof theValue === "object" && theValue !== null;
        
        console.log(`[calculateObjectProperties] Property: ${propertyName}, excluded: ${isExcluded}, isObject: ${isObject}, depth: ${depth}`);
        
        if ((theValue !== undefined || options.isUndefinedValueVisible) && !isExcluded) {
          const attribute = attributeList ? attributeList.find((attr: any) => attr.name === propertyName) : null;
          const xsdType = attribute ? attribute.type : "";
          const xsdPrefix = xsdType ? xsdType.split(":")[0] : "";
          const nameWithoutPrefix = propertyName.split(":").pop();
          
          // Fix: Avoid double prefixing - if propertyName already has a prefix, use it as is
          const nameWithPrefix = propertyName.includes(":") ? propertyName : (xsdPrefix ? xsdPrefix + ":" : "") + propertyName;
          const currentPath = parentPath ? `${parentPath}.${nameWithoutPrefix}` : nameWithoutPrefix;

          // not an object ?
          if (typeof theValue !== "object" || theValue === null) {
            // Comparison (red and yellow value display)
            let displayedValueOld = null;
            if (objectOld && modifiedObjectData && modifiedObjectData.properties) {
              const propertyNameSearch = propertyName === "absPos" ? "KP" : propertyName;
              if (modifiedObjectData.properties.find((p: any) => p.name.split(":").pop() === propertyNameSearch)) {
                displayedValueOld = this.getDisplayedValue(objectOld, propertyName);
              }
            }

            const property: IModelObjectProperty = {
              object,
              name: nameWithoutPrefix,
              displayedName: this.translateService.translateModelPropertyName(nameWithoutPrefix),
              value: theValue,
              displayedValue: this.getDisplayedValue(object, propertyName),
              type: this.getValueType(object, propertyName),
              xsdType,
              xsdPrefix,
              nameWithPrefix,
              displayedValueOld,
              depth,
              parentPath,
              isHeader: false,
              sortKey: String(this.propertySequenceCounter++).padStart(6, '0'),
            };
            properties.push(property);
          } else {
            // Handle object/array values
            const thePropertyValue = this.getPropertyValue(object, propertyName);
            if (typeof thePropertyValue !== "object") {
              // Complex property with xmlValue
              let displayedValueOld = null;
              if (objectOld && modifiedObjectData && modifiedObjectData.properties) {
                const propertyNameSearch = propertyName === "absPos" ? "KP" : propertyName;
                if (modifiedObjectData.properties.find((p: any) => p.name.split(":").pop() === propertyNameSearch)) {
                  displayedValueOld = this.getDisplayedValue(objectOld, propertyName);
                }
              }

              const property: IModelObjectProperty = {
                object,
                name: nameWithoutPrefix,
                displayedName: this.translateService.translateModelPropertyName(nameWithoutPrefix),
                value: this.getPropertyValue(object, propertyName),
                displayedValue: this.getDisplayedValue(object, propertyName),
                type: this.getValueType(object, propertyName),
                xsdType,
                xsdPrefix,
                nameWithPrefix,
                displayedValueOld,
                depth,
                parentPath,
                isHeader: false,
                sortKey: String(this.propertySequenceCounter++).padStart(6, '0'),
              };
              properties.push(property);
            } else {
              // Nested object or array - process recursively
              console.log(`[calculateObjectProperties] Calling extractNestedProperties for: ${propertyName}, depth: ${depth}`);
              const nestedProperties = this.extractNestedProperties(
                theValue,
                nameWithoutPrefix,
                propertyName, // Pass full property name with prefix
                excludedProperties,
                options,
                depth,
                currentPath
              );
              console.log(`[calculateObjectProperties] Got ${nestedProperties.length} nested properties for: ${propertyName}`);
              properties = properties.concat(nestedProperties);
            }
          }
        }
      });
    } catch (ex) {
      console.error(ex);
    }
    return properties;
  }

  /**
   * Extract properties from nested objects and arrays
   * @param value The nested value (object or array)
   * @param propertyName The property name
   * @param excludedProperties The excluded properties
   * @param options The options
   * @param depth The current depth level
   * @param parentPath The parent path for hierarchy
   * @returns The list of properties
   */
  private extractNestedProperties(
    value: any,
    propertyName: string,
    fullPropertyName: string, // Keep full name with namespace prefix
    excludedProperties: string[],
    options: any,
    depth: number,
    parentPath: string
  ): IModelObjectProperty[] {
    const properties: IModelObjectProperty[] = [];
    // Minimal exclusions - show all data properties including type, label, xmlType, id
    const minimalExclusions = ["isSelected", "isCollapsed", "safeStyle", "ref"];

    console.log(`[extractNestedProperties] Processing: ${fullPropertyName}, depth: ${depth}, isArray: ${Array.isArray(value)}, isObject: ${typeof value === 'object'}`);

    if (Array.isArray(value)) {
      // Handle array of objects
      if (value.length > 0) {
        // Add header for the array - show full name with prefix
        const headerProperty: IModelObjectProperty = {
          object: null,
          name: propertyName,
          displayedName: fullPropertyName, // Show full name with namespace
          value: `[${value.length} item${value.length > 1 ? 's' : ''}]`,
          displayedValue: `[${value.length} item${value.length > 1 ? 's' : ''}]`,
          type: "array",
          xsdType: "",
          xsdPrefix: "",
          nameWithPrefix: fullPropertyName,
          displayedValueOld: null,
          depth: depth + 1,
          parentPath,
          isHeader: true,
          isCollapsed: false,
          childCount: value.length,
          sortKey: String(this.propertySequenceCounter++).padStart(6, '0'),
        };
        properties.push(headerProperty);

        // Process each item in the array - show ALL actual properties
        value.forEach((item: any, index: number) => {
          if (typeof item === "object" && item !== null) {
            const itemPath = `${parentPath}.${propertyName}[${index}]`;
            console.log(`[extractNestedProperties] Processing array item ${index} of ${propertyName}`);
            const itemProperties = this.extractActualNestedProperties(
              item,
              minimalExclusions,
              options,
              depth + 2,
              itemPath
            );
            console.log(`[extractNestedProperties] Array item ${index} produced ${itemProperties.length} properties`);
            properties.push(...itemProperties);
          }
        });
      }
    } else if (typeof value === "object" && value !== null) {
      // Handle nested object
      // Add header for the nested object - show full name with prefix
      const typeLabel = value.type ? value.type.split(":").pop() : propertyName;
      const headerProperty: IModelObjectProperty = {
        object: value,
        name: propertyName,
        displayedName: fullPropertyName, // Show full name with namespace
        value: typeLabel,
        displayedValue: typeLabel,
        type: "object",
        xsdType: value.type || "",
        xsdPrefix: "",
        nameWithPrefix: fullPropertyName,
        displayedValueOld: null,
        depth: depth + 1,
        parentPath,
        isHeader: true,
        isCollapsed: false,
        sortKey: String(this.propertySequenceCounter++).padStart(6, '0'),
      };
      properties.push(headerProperty);

      // Recursively get ALL actual properties from nested object
      const nestedProperties = this.extractActualNestedProperties(
        value,
        minimalExclusions,
        options,
        depth + 2,
        `${parentPath}.${propertyName}`
      );
      console.log(`[extractNestedProperties] Object ${propertyName} produced ${nestedProperties.length} nested properties`);
      properties.push(...nestedProperties);
    }

    console.log(`[extractNestedProperties] Returning ${properties.length} total properties for ${propertyName}`);
    return properties;
  }

  /**
   * Extract all actual properties from a nested object
   * This ensures we show all properties that actually exist in the data
   * @param object The nested object
   * @param excludedProperties Properties to exclude (minimal list)
   * @param options Options
   * @param depth Current depth
   * @param parentPath Parent path for hierarchy
   * @returns List of properties
   */
  private extractActualNestedProperties(
    object: any,
    excludedProperties: string[],
    options: any,
    depth: number,
    parentPath: string
  ): IModelObjectProperty[] {
    const properties: IModelObjectProperty[] = [];

    if (!object || typeof object !== "object") {
      return properties;
    }

    // Minimal exclusions - only exclude UI-specific properties, NOT data properties
    const minimalExclusions = ["isSelected", "isCollapsed", "safeStyle", "ref"];

    console.log(`[extractActualNestedProperties] Processing object at depth ${depth}, parentPath: ${parentPath}`);
    console.log(`[extractActualNestedProperties] Object keys:`, Object.keys(object));

    // Only iterate over actual properties in the object (not from metadata)
    for (const propertyName in object) {
      if (!object.hasOwnProperty(propertyName)) {
        continue;
      }

      const theValue = object[propertyName];
      const valueType = typeof theValue;
      const isArray = Array.isArray(theValue);
      
      console.log(`[extractActualNestedProperties] Property: ${propertyName}, type: ${valueType}, isArray: ${isArray}, value:`, theValue);
      
      // Skip only minimal UI-specific properties
      if (minimalExclusions.includes(propertyName)) {
        console.log(`[extractActualNestedProperties] Skipping ${propertyName} (in exclusion list)`);
        continue;
      }

      // Skip undefined values
      if (theValue === undefined) {
        console.log(`[extractActualNestedProperties] Skipping ${propertyName} (undefined)`);
        continue;
      }

      const nameWithoutPrefix = propertyName.split(":").pop();

      if (typeof theValue !== "object" || theValue === null) {
        // Primitive value - create property (including type, label, xmlType, id)
        console.log(`[extractActualNestedProperties] Creating primitive property: ${propertyName} = ${theValue}`);
        const property: IModelObjectProperty = {
          object,
          name: nameWithoutPrefix,
          displayedName: propertyName, // Show full name with namespace prefix
          value: theValue,
          displayedValue: String(theValue),
          type: this.getValueType(object, propertyName),
          xsdType: "",
          xsdPrefix: propertyName.includes(":") ? propertyName.split(":")[0] : "",
          nameWithPrefix: propertyName,
          displayedValueOld: null,
          depth,
          parentPath,
          isHeader: false,
          sortKey: String(this.propertySequenceCounter++).padStart(6, '0'),
        };
        properties.push(property);
      } else {
        // Nested object or array - extract recursively
        console.log(`[extractActualNestedProperties] Found nested ${isArray ? 'array' : 'object'}: ${propertyName}`);
        const currentPath = parentPath ? `${parentPath}.${nameWithoutPrefix}` : nameWithoutPrefix;
        const nestedProperties = this.extractNestedProperties(
          theValue,
          nameWithoutPrefix,
          propertyName, // Pass full name with prefix
          minimalExclusions, // Use minimal exclusions for deeper nesting too
          options,
          depth,
          currentPath
        );
        console.log(`[extractActualNestedProperties] Nested ${propertyName} produced ${nestedProperties.length} properties`);
        properties.push(...nestedProperties);
      }
    }

    console.log(`[extractActualNestedProperties] Returning ${properties.length} total properties`);
    return properties;
  }

  /**
   * Merge properties of several objects
   * @param properties The properties
   * @param newProperties The merged properties
   */
  public mergeProperties(properties: IModelObjectProperty[], newProperties: IModelObjectProperty[]) {
    newProperties.forEach((newProperty: any) => {
      // For nested properties, use unique key (parentPath + name) to avoid incorrect merging
      // For flat properties (depth 0), use just name for backward compatibility
      const uniqueKey = this.getPropertyUniqueKey(newProperty);
      const property = this.findPropertyByUniqueKey(properties, uniqueKey);
      
      if (property) {
        // Only merge flat properties (depth 0) - nested properties should be kept separate
        if (!newProperty.depth || newProperty.depth === 0) {
          if (newProperty.value !== property.value) {
            property.displayedValue = "-";
          }
        }
        // Skip adding duplicate nested properties
      } else {
        newProperty.isSelected = false;
        properties.push(newProperty);
      }
    });
  }

  /**
   * Get unique key for a property (considers parentPath for nested properties)
   * @param property The property
   * @returns Unique key string
   */
  private getPropertyUniqueKey(property: any): string {
    if (property.depth && property.depth > 0 && property.parentPath) {
      return `${property.parentPath}.${property.name}`;
    }
    return property.name;
  }

  /**
   * Find a property by its unique key
   * @param properties The properties
   * @param uniqueKey The unique key
   * @returns The found property
   */
  private findPropertyByUniqueKey(properties: IModelObjectProperty[], uniqueKey: string) {
    return properties ? properties.find((p: any) => this.getPropertyUniqueKey(p) === uniqueKey) : null;
  }

  /**
   * Find a property from its name
   * @param properties The properties
   * @param name The name
   * @returns The found property
   */
  public findProperty(properties: IModelObjectProperty[], name: string) {
    return properties ? properties.find((p: any) => p.name === name) : null;
  }

  /**
   * Get the type of a value
   * @param object The object
   * @param propertyName The property name
   * @returns The value type
   */
  public getValueType(object: any, propertyName: string): string {
    let res = "any";
    const value = object[propertyName];
    if (this.isValueBoolean(value)) {
      res = "boolean";
    }
    if (this.isValueNumber(value)) {
      res = "number";
    }
    return res;
  }

  /**
   * Get property value
   * @param object The object
   * @param propertyName The name of the property
   * @returns The value
   */
  public getPropertyValue(object: any, propertyName: string): any {
    let res: any = null;
    if (object && propertyName) {
      res = object[propertyName];
      if (res === undefined) {
        res = null;
      } else if (res && typeof res === "object" && res.xmlValue !== undefined) {
        res = res.xmlValue;
      }
    }
    return res;
  }

  /**
   * Get the displayed value for a property of an object, (Boolean, Can be translated, unit added...)
   * @param object The object
   * @param propertyName The name of the property
   * @returns The displayed value
   */
  public getDisplayedValue(object: any, propertyName: string): string {
    let res: any = "";
    if (object && propertyName) {
      res = object[propertyName];
      if (res === undefined || res === null) {
        res = "";
      } else if (this.isValueBoolean(res)) {
        res = this.getBooleanDisplayedValue(res);
      } else if (res && typeof res === "object" && res.xmlValue !== undefined) {
        res = res.xmlValue;
      }

      // else {
      //   const boLinks = this.getModelConfig().boLinks;
      //   const boLink = boLinks.find((bol: string[]) => bol[0] == propertyName);
      //   if (boLink) {
      //     const linkedObject = object[boLink[1]];
      //     if (linkedObject && linkedObject.id && linkedObject.label && linkedObject.type) {
      //       res = linkedObject.label + " (" + this.getTypeLabel(linkedObject.type) + ") id = " + linkedObject.id;
      //     }
      //   }
      // }

      res = res + this.calcPropertyUnitText(object, propertyName);
    }

    return res;
  }

  /**
   * Get the unit text value of the property of an object
   * @param object The object
   * @param propertyName The name of the property
   * @returns The unit text value
   */
  private calcPropertyUnitText(object: any, propertyName: string): string {
    let res = "";
    const unitData = this.propertiesUnitsMap.get(propertyName);
    if (unitData && unitData.label) {
      res = " (" + unitData.label + ")";
    }
    return res;
  }

  /**
   * Test if a value is boolean
   * @param value The value
   * @returns Boolean value
   */
  public isValueBoolean(value: any): boolean {
    return ["true", "false"].includes(String(value));
  }

  /**
   * Test if a value is a number
   * @param value The value
   * @returns Boolean value
   */
  public isValueNumber(value: any): boolean {
    return !isNaN(Number(value));
  }

  /**
   * Get the label of the type of an object
   * @param object The object
   * @returns Text value
   */
  public getObjectTypeLabel(object: any): string {
    return object && object.type ? this.getTypeLabel(object.type) : "";
  }

  /**
   * Get the label of a type (user friendly, translated)
   * @param type The type
   * @returns Text value
   */
  public getTypeLabel(type: string): string {
    // return type !== "treeMenuNode" ? this.capitalize(this.translateService.translateFromMap(type)) : "";
    return type !== "treeMenuNode" ? this.capitalize(this.translateService.translateModelClassName(type)) : "";
  }

  /**
   * Get the value of a property of an object
   * @param object The object
   * @param propertyName The name of the property
   * @param label The label
   * @returns The string value
   */
  public getPropertyText(object: any, propertyName: string, label: string = null): string {
    let res = "";
    label = label !== null ? label : propertyName;
    if (object && object[propertyName] !== undefined) {
      res = object[propertyName];
      if (label !== "") {
        res = label + res + " ";
      }
    }
    return res;
  }

  /**
   * Toggle a boolean property
   * @param property The property
   */
  public toggleBooleanProperty(property: IModelObjectProperty) {
    const value = property.value === true || property.value == "true";
    property.value = !value;
    property.displayedValue = this.getBooleanDisplayedValue(property.value);
  }

  /**
   * Get the displayed value of a boolean property
   * @param value The value
   * @returns The displayed value
   */
  public getBooleanDisplayedValue(value: any): string {
    const bValue = value === true || value == "true";
    return this.translateService.translateFromMap(String(bValue));
  }

  // Utils
  /**
   * Set the first letter uppercase
   * @param s The string value
   * @returns The transformed string
   */
  public capitalize(s: string): string {
    return typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  }

  /**
   * Get the int value of a value
   * @param value The value
   * @returns Int
   */
  public getIntValue(value: any): number {
    return value !== undefined ? parseInt(String(value).replace(",", ".")) : 0;
  }

  /**
   * Get the float value of a value
   * @param value The value
   * @returns Float
   */
  public getFloatValue(value: any): number {
    return value !== undefined ? parseFloat(String(value).replace(",", ".")) : 0;
  }
}
