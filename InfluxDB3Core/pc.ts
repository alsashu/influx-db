import { Component, OnInit, Input } from "@angular/core";
import { ModelConstService } from "../../../services/model/model-const.service";
import { IModelMetadataService } from "../../../services/model/model-metadata.service";
import { ServicesService } from "src/app/services/services/services.service";
import { ServicesConst } from "src/app/services/services/services.const";
import { IModelPropertiesService } from "src/app/services/model/model-properties.service";
import { ITranslateService, TranslateService } from "src/app/services/translate/translate.service";
import { IGraphicConfigService } from "src/app/services/config/graphic-config.service";
import { ICompareService } from "src/app/services/compare/compare.service";

/**
 * Properties component
 */
@Component({
  selector: "app-properties",
  templateUrl: "./properties.component.html",
  styleUrls: ["./properties.component.css"],
})
export class PropertiesComponent implements OnInit {
  @Input()
  set options(options: any) {
    if (options) {
      for (const prop in options) {
        this._options[prop] = options[prop];
      }
    }
  }
  get options(): any {
    return this._options;
  }

  /**
   * Component options
   */
  public _options: any = {
    isModificationStatusVisible: false,
    isRayStatusVisible: true,
    isCheckStatusVisible: false,
    isDebugVisible: false,
    isSelectionVisible: true,
    isReadOnly: false,
    isHeaderVisible: true,
    isUndefinedValueVisible: false, // true
    isChangeSelectionMode: false,
    isSortRevert: false,
    getObjectList: () => [],
    getDebugData: (o: any) => [],
    onModifyProperty: (property: any, objectList: any[]) => {},
    onCheckStatusValidate: (property: any, objectList: any[]) => {},
  };

  /**
   * The list of properties
   */
  public properties: any[] = [];

  public objectList: any[] = [];
  public firstObject: any = null;

  /**
   * Tooltip state
   */
  public isTooltipVisible: boolean = false;
  public tooltipX: number = 0;
  public tooltipY: number = 0;

  /**
   * Debug data
   */
  public debugData: string = null;

  /**
   * Header data
   */
  public headerData: {
    o: null;
    html: "";
    name: null;
    id: null;
    type: null;
    subtype: null;
    state: null;
    project: null;
  } = null;

  /**
   * Ace editor options
   */
  public aceOptions: any = {
    maxLines: 10000,
    printMargin: false,
    useSoftTabs: true,
    tabSize: 2,
    navigateWithinSoftTabs: true,
    wrap: true,
    autoScrollEditorIntoView: undefined,
  };

  /**
   * Excluded properties
   */
  private excludedProperties = [
    "isSelected",
    "isCollapsed",
    "safeStyle",
    "id",
    "type",
    "xmlType",
    "compareMetaData",
    "metaData",
  ];

  public modelMetadataService: IModelMetadataService;
  public modelPropertiesService: IModelPropertiesService;
  public translateService: ITranslateService;
  private graphicConfigService: IGraphicConfigService;
  public compareService: ICompareService;

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(private servicesService: ServicesService) {
    this.modelMetadataService = this.servicesService.getService(
      ServicesConst.ModelMetadataService
    ) as IModelMetadataService;
    this.modelPropertiesService = this.servicesService.getService(
      ServicesConst.ModelPropertiesService
    ) as IModelPropertiesService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.graphicConfigService = this.servicesService.getService(
      ServicesConst.GraphicConfigService
    ) as IGraphicConfigService;
    this.compareService = this.servicesService.getService(ServicesConst.CompareService) as ICompareService;
  }

  /**
   * On init
   */
  public ngOnInit() {}

  /**
   * Get the model config
   * @returns The config model
   */
  public getModelConfig() {
    return this.modelMetadataService.modelConfig;
  }

  /**
   * Get the list of properties of an object
   * @param object The object
   * @param excludedProperties The excluded properties
   * @param options Options
   * @returns The properties
   */
  public getObjectProperties(object: any, excludedProperties: string[], options: any) {
    return this.modelPropertiesService.getObjectProperties(object, excludedProperties, options);
  }

  /**
   * Refresh the component
   */
  public refresh() {
    const objectList = this.getObjectList();
    this.objectList = objectList;
    this.firstObject = objectList && objectList.length === 1 ? objectList[0] : null;
    this.updateProperties(objectList);
    this.updateHeader(objectList);
  }

  /**
   * Update the properties of a list of objects
   * @param objectList The objects
   */
  public updateProperties(objectList: any[]) {
    let properties = [];
    if (objectList) {
      objectList.forEach((object: any) => {
        if (!object.forEach && object.type !== "treeMenuNode") {
          const excludedProperties = this.excludedProperties;
          this.modelPropertiesService.mergeProperties(
            properties,
            this.getObjectProperties(object, excludedProperties, {
              getMetaData: objectList.length === 1,
              isUndefinedValueVisible: this._options.isUndefinedValueVisible,
              calcRedAndYellowOldValue: true,
              // TODO test
              //getAdditionalInfos: false,
              getAdditionalInfos: true,
            })
          );
        }
      });
      
      // Separate flat properties (depth 0) from nested properties (depth > 0)
      const flatProperties = properties.filter((p: any) => !p.depth || p.depth === 0);
      const nestedProperties = properties.filter((p: any) => p.depth && p.depth > 0);
      
      // Sort flat properties alphabetically
      const sortFunction = this._options.sortFunction
        ? this._options.sortFunction
        : this.modelPropertiesService.sortFunctions.displayedNameSortFunction;
      flatProperties.sort(sortFunction);
      
      // Sort nested properties by their sortKey to maintain hierarchy
      nestedProperties.sort((a: any, b: any) => {
        const keyA = a.sortKey || '';
        const keyB = b.sortKey || '';
        return keyA.localeCompare(keyB);
      });
      
      // Combine: flat properties first, then nested hierarchy
      properties = [...flatProperties, ...nestedProperties];
      
      if (this._options.isSortRevert) {
        // Only reverse flat properties, keep nested hierarchy intact
        const reversedFlat = flatProperties.reverse();
        properties = [...reversedFlat, ...nestedProperties];
      }
    }
    
    // Debug: log all properties
    console.log('[updateProperties] Total properties:', properties.length);
    const nestedCount = properties.filter((p: any) => p.depth && p.depth > 0).length;
    console.log('[updateProperties] Nested properties count:', nestedCount);
    properties.forEach((p: any, index: number) => {
      console.log(`[updateProperties] Property ${index}: name=${p.displayedName}, value=${p.displayedValue}, depth=${p.depth}, isHeader=${p.isHeader}`);
    });
    
    this.properties = properties;
    //localStorage.setItem("alm-prop", JSON.stringify(this.properties));
  }

  /**
   * Update the header
   * @param objectList The objects
   */
  public updateHeader(objectList: any[]) {
    this.headerData = this.calcHeaderData(objectList);
  }

  /**
   * Calculate the haeder data
   * @param objectList
   * @returns
   */
  public calcHeaderData(objectList: any[]): any {
    const headerData = {
      o: null,
      html: "",
      name: null,
      id: null,
      type: null,
      subtype: null,
      state: null,
      project: null,
      dataPerVersion: null,
    };
    if (objectList && objectList.length === 1) {
      const o = objectList[0];
      if (o.type !== "treeMenuNode") {
        headerData.o = o;
        headerData.name = o.name || o.label;
        headerData.id = o.id;
        headerData.type = this.modelPropertiesService.getObjectTypeLabel(o);
        headerData.subtype = this.graphicConfigService.getSubType(o);

        headerData.state = o.metaData ? this.translateFromMap(o.metaData.objectState) : null;
        // headerData.project = o.compareMetaData ? o.compareMetaData.projectLabel : null;

        // Compare projects
        const compareMap = this.compareService.getCompareObjectsDataMap(o);
        if (compareMap) {
          // console.log(compareMap);
          if (compareMap && compareMap.dataPerVersionList && compareMap.dataPerVersionList.length === 2) {
            const dataNewVersion = compareMap.dataPerVersionList[1];
            if (dataNewVersion) {
              headerData.dataPerVersion = dataNewVersion;
            }
          }
        }
      }
    }
    return headerData;
  }

  /**
   * Translate string
   * @param s The string value
   * @returns The translated value, s if not translation found
   */
  public translateFromMap(s: string): string {
    return this.translateService.translateFromMap(s);
  }

  /**
   * Modify a property
   * @param property The property
   * @param objectList The objects
   */
  public modifyProperty(property: any, objectList: any[]) {
    this._options.onModifyProperty(property, objectList);
  }

  /**
   * Is selection visible or not
   * @returns Boolean
   */
  public isSelectionVisible() {
    return this._options.isSelectionVisible;
  }

  /**
   * Get the list of objets from which the properties are displayed
   * @returns The objects
   */
  public getObjectList(): any[] {
    let objectList = [];
    objectList = this._options.getObjectList();

    let debugData = null;
    if (objectList.length === 1) {
      const o = objectList[0];
      try {
        debugData = this._options.getDebugData(o);
      } catch (ex) {
        console.error(ex);
      }
    }
    this.debugData = debugData;

    return objectList;
  }

  /**
   * On enter event
   * @param event Event
   * @param property Property
   */
  public onPropertyEnter(event: any, property: any) {
    this.modifyProperty(property, this.getObjectList());
  }

  /**
   * On click event on a label
   * @param event The event
   * @param property The property
   */
  public onPropertyLabelClick(event: any, property: any) {
    if (this.isSelectionVisible()) {
      if (this._options.isChangeSelectionMode) {
        if (
          [ModelConstService.CHANGE_STATUS_NEW, ModelConstService.CHANGE_STATUS_MODIFIED].includes(
            property.changeStatus
          )
        ) {
          this.togglePropertyIsSelected(property);
        }
      } else {
        this.selectProperty(property);
      }
    }
    event.preventDefault();
  }

  /**
   * On double click event on a label
   * @param event
   * @param property
   */
  public onPropertyLabelDoubleClick(event: any, property: any) {}

  /**
   * On double click event on a property value
   * @param event
   * @param property
   */
  public onPropertyValueDoubleClick(event: any, property: any) {
    // if (property.type == "boolean" && !this._options.isReadOnly) {
    //   this.toggleBooleanProperty(property);
    // }
  }

  // public toggleBooleanProperty(property: any) {
  //   this.modelPropertiesService.toggleBooleanProperty(property);
  //   this.modifyProperty(property, this.getObjectList());
  // }

  /**
   * Toggle isselected value of a property
   * @param property
   */
  public togglePropertyIsSelected(property: any) {
    property.isSelected = !property.isSelected;
  }

  /**
   * On focus event on property value
   * @param event The event
   * @param property The property
   */
  public onPropertyValueFocus(event: any, property: any) {
    if (this.isSelectionVisible() && !this._options.isChangeSelectionMode) {
      this.selectProperty(property);
    }
  }

  /**
   * Select a property
   * @param property The property
   */
  public selectProperty(property: any) {
    this.properties.forEach((p: any) => (p.isSelected = p == property));
  }

  /**
   * Get compare data of the selected object
   * @returns compare data, null if multi selection or not found
   */
  private getCompareObjectsDataMap(): any {
    if (this.firstObject) {
      const dataMap = this.compareService.getCompareObjectsDataMap(this.firstObject);
      return dataMap;
    }
    return null;
  }

  /**
   * Get data per version list of the selected object
   * @returns an array
   */
  public getDataPerVersionList(): any[] {
    const dataMap = this.getCompareObjectsDataMap();
    return dataMap ? dataMap.dataPerVersionList : [];
  }

  /**
   * Get data per version list of the selected object
   * @returns an array
   */
  public getPropertyDataPerVersionList(property: any): any[] {
    const res = [];
    if (property) {
      const dataPerVersionList = this.getDataPerVersionList();
      if (dataPerVersionList) {
        dataPerVersionList.forEach((dataPerVersion: any) => {
          const comparePropertyData = dataPerVersion.properties
            ? dataPerVersion.properties.find((p: any) => p.name === property.name)
            : null;
          let displayedValue =
            ["none", "deleted"].includes(dataPerVersion.compareState) || dataPerVersion.object === null
              ? ""
              : property.displayedValue;

          if (dataPerVersion.object) {
            displayedValue = this.modelPropertiesService.getDisplayedValue(dataPerVersion.object, property.name);
          }
          res.push({
            versionLabel: dataPerVersion.versionLabel,
            displayedValue: displayedValue,
            dataPerVersion,
          });
        });
      }
    }

    return res;
  }

  /**
   * Test if multi projects comparison is enabled
   * @returns
   */
  public isComparisonDisplayEnabled(): boolean {
    return this.objectList.length === 1 && this.compareService.multiVersionComparisonIsComputed();
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

  public getPropertyObject(s: string): string {
    return this.translateService.translateFromMap(s);
  }

  /**
   * Check if the current object has additional info
   * @returns boolean indicating if additional info exists
   */
  public hasAdditionalInfo(): boolean {
    // Check if component is ready
    if (!this.firstObject || !this.objectList || this.objectList.length === 0) {
      return false;
    }
    
    if (this.firstObject.additionInfosList) {
      return this.firstObject.additionInfosList.length > 0;
    }
    
    return false;
  }

  /**
   * Generate tooltip content for additional info
   * @returns HTML string for tooltip
   */
  public getAdditionalInfoTooltip(): string {
    if (!this.hasAdditionalInfo()) {
      return '';
    }

    let tooltipContent = '<div class="additional-info-tooltip">';
    tooltipContent += '<h6>Additional Information</h6>';
    tooltipContent += '<table class="table table-sm table-borderless">';
    tooltipContent += '<thead><tr><th>Property</th><th>Value</th></tr></thead><tbody>';

    this.firstObject.additionInfosList.forEach((additionalInfo: any) => {
      // Add basic properties
      for (const propName in additionalInfo) {
        if (['id', 'type', 'xmlType', 'label', 'ref'].includes(propName)) {
          continue; // Skip metadata properties
        }

        const propValue = additionalInfo[propName];
        let displayValue = '';

        if (typeof propValue === 'object' && propValue !== null) {
          if (propValue.xmlValue !== undefined) {
            displayValue = propValue.xmlValue;
          } else if (propValue.label !== undefined) {
            displayValue = propValue.label;
          } else if (propValue.value !== undefined) {
            displayValue = propValue.value;
          } else {
            displayValue = JSON.stringify(propValue);
          }
        } else {
          displayValue = String(propValue);
        }

        // Clean up property name (remove namespace prefix)
        const cleanPropName = propName.includes(':') ? propName.split(':').pop() : propName;
        
        tooltipContent += `<tr><td><strong>${cleanPropName}</strong></td><td>${displayValue}</td></tr>`;
      }
    });

    tooltipContent += '</tbody></table></div>';
    return tooltipContent;
  }

  /**
   * Get property names for additional info (excluding metadata)
   * @param additionalInfo The additional info object
   * @returns Array of property names
   */
  public getAdditionalInfoPropertyNames(additionalInfo: any): string[] {
    const excludedProps = ['id', 'type', 'xmlType', 'label', 'ref'];
    return Object.keys(additionalInfo).filter(propName => !excludedProps.includes(propName));
  }

  /**
   * Get clean property name (remove namespace prefix)
   * @param propName The property name
   * @returns Clean property name
   */
  public getCleanPropertyName(propName: string): string {
    return propName.includes(':') ? propName.split(':').pop() : propName;
  }

  /**
   * Get property value for additional info
   * @param additionalInfo The additional info object
   * @param propName The property name
   * @returns Displayable value
   */
  public getAdditionalInfoPropertyValue(additionalInfo: any, propName: string): string {
    const propValue = additionalInfo[propName];
    
    if (typeof propValue === 'object' && propValue !== null) {
      if (propValue.xmlValue !== undefined) {
        return propValue.xmlValue;
      } else if (propValue.label !== undefined) {
        return propValue.label;
      } else if (propValue.value !== undefined) {
        return propValue.value;
      } else {
        return JSON.stringify(propValue);
      }
    } else {
      return String(propValue);
    }
  }

  /**
   * Show the additional info tooltip
   * @param event The mouse event
   */
  public showAdditionalInfoTooltip(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Position tooltip below the Additional Info link
    this.tooltipX = rect.left;
    this.tooltipY = rect.bottom + 10;
    
    this.isTooltipVisible = true;
  }

  /**
   * Hide the additional info tooltip
   */
  public hideAdditionalInfoTooltip(): void {
    this.isTooltipVisible = false;
  }
}
