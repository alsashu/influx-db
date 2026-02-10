import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { ServicesService } from "../../../services/services/services.service";
import { ServicesConst } from "src/app/services/services/services.const";
import { AViewComponent } from "../base/aview.component";
import { IViewComponent } from "src/app/services/view/iview.component";
import { ModificationViewActionsService } from "./modification-view-actions.service";
import { MvcConst } from "src/app/services/mvc/mvc.const";
import { IApiService } from "src/app/services/api/api.service";
import { IModelService } from "src/app/services/model/model.service";
import { ISelectionService } from "src/app/common/services/selection/selection.service";

@Component({
  selector: "app-modification-view",
  templateUrl: "./modification-view.component.html",
  styleUrls: ["./modification-view.component.css"],
})
export class ModificationViewComponent extends AViewComponent implements OnInit, OnDestroy, IViewComponent {
  public static viewType = "modification-view";

  public actionsService = new ModificationViewActionsService(this);

  public modifications: any[] = [];
  public filteredModifications: any[] = [];
  public mvcEventSubscription: any;
  public isLoading = false;
  public errorMessage = "";

  // Search and sorting
  public searchText = "";
  public sortColumn = "date";
  public sortDirection: "asc" | "desc" = "desc"; // newest first

  private apiService: IApiService;
  private modelService: IModelService;
  private selectionService: ISelectionService;

  constructor(
    public changeDetectorRef: ChangeDetectorRef,
    public servicesService: ServicesService
  ) {
    super(ModificationViewComponent.viewType, servicesService);

    this.apiService = this.servicesService.getService(ServicesConst.ApiService) as IApiService;
    this.modelService = this.servicesService.getService(ServicesConst.ModelService) as IModelService;
    this.selectionService = this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService;
  }

  public ngOnInit() {
    this.initMvc();
  }

  public ngOnDestroy() {
    if (this.mvcEventSubscription) {
      this.mvcEventSubscription.unsubscribe();
    }
  }

  /**
   * Subscribe to MVC events:
   * - load report when view becomes active
   * - clear when project closes
   */
  private initMvc() {
    this.mvcEventSubscription = this.mvcService.mvcEvent.subscribe((message: any) => {
      if (message.type === MvcConst.MSG_PROJECT_CLOSED) {
        this.clearModifications();
      } else if (message.type === MvcConst.MSG_VIEW_SELECTION_CHANGED) {
        if (this.isThisView(message.view)) {
          this.loadModificationReport();
        }
      }
    });
  }

  /**
   * Load modification report from server when Modification tab is active.
   */
  public loadModificationReport() {
    const project = this.modelService.getSelectedProject();
    if (!project) {
      this.clearModifications();
      return;
    }

    const projectId = project.id;
    const projectName = project.projectName || project.label;

    if (!projectId || !projectName) {
      this.errorMessage = "Project ID or name is missing";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";

    this.apiService
      .getModificationReport(projectId, projectName)
      .then((response: any) => {
        this.isLoading = false;

        if (response && response.result === "ok" && response.modificationReport) {
          this.parseModificationReport(response.modificationReport);
        } else if (response) {
          // Some servers may already return the inner report object
          this.parseModificationReport(response);
        } else {
          this.clearModifications();
        }

        this.changeDetectorRef.detectChanges();
      })
      .catch((error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || "Failed to load modification report";
        this.clearModifications();
        this.changeDetectorRef.detectChanges();
      });
  }

  /**
   * Parse the modification report and flatten into table rows.
   * Expected shape:
   * - report.modificationReports.modificationReport.segments[]
   * - or report.segments[] directly
   */
  private parseModificationReport(report: any) {
    const rows: any[] = [];

    try {
      const modificationReports = report?.modificationReports;
      if (!modificationReports) {
        if (report?.segments) {
          this.processSegments(report.segments, rows);
          this.modifications = rows;
          this.applyFilterAndSort();
          return;
        }
        this.modifications = [];
        this.applyFilterAndSort();
        return;
      }

      const modificationReport = modificationReports?.modificationReport;
      if (!modificationReport) {
        this.modifications = [];
        this.applyFilterAndSort();
        return;
      }

      const segments = modificationReport?.segments;
      if (!segments) {
        this.modifications = [];
        this.applyFilterAndSort();
        return;
      }

      if (Array.isArray(segments)) {
        segments.forEach((segment: any) => this.processSegments(segment, rows));
      } else {
        this.processSegments(segments, rows);
      }

      this.modifications = rows;
      this.applyFilterAndSort();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error parsing modification report:", e);
      this.modifications = [];
      this.applyFilterAndSort();
    }
  }

  /**
   * Process segment object: collect all element types and push rows.
   */
  private processSegments(segments: any, rows: any[]) {
    const elementTypes = [
      { key: "newElements", state: "NEW" },
      { key: "deletedElements", state: "DELETED" },
      { key: "changedElements", state: "CHANGED" },
      { key: "changedParentChangedElements", state: "PARENTCHANGED" },
      { key: "graphicalChangeOnlyElements", state: "GRAPHICALCHANGEONLY" },
    ];

    elementTypes.forEach(({ key, state }) => {
      const elements = segments[key];
      if (elements && Array.isArray(elements)) {
        elements.forEach((element: any) => this.processElement(element, state, rows));
      }
    });
  }

  /**
   * Process a single element and add rows to the table.
   * - defaultState comes from element group (NEW/DELETED/CHANGED/...)
   */
  private processElement(element: any, defaultState: string, rows: any[]) {
    const baseRow = {
      date: element.date || "",
      version: element.version || "",
      user: element.user || "",
      objectId: element.idRef || "",
      objectName: element.nameRef || "",
      state: defaultState,
      parentObjectName: element.parentObjectName || "",
      elementClass: element.elementType || "",
      subtype: element.elementSubtype || "",
      crNumber: element.modificationJustification?.crNumber || "",
      justification: element.modificationJustification?.justification || "",
    };

    const modifiedProperties = element.modifiedProperties;

    if (modifiedProperties && Array.isArray(modifiedProperties) && modifiedProperties.length > 0) {
      modifiedProperties.forEach((prop: any) => {
        rows.push({
          ...baseRow,
          propertyName: prop.propertyName || "",
          originalValue: prop.previousVersionValue || "",
          updatedValue: prop.newVersionValue || "",
          index: prop.index || "",
          propertiesL1: prop.propertyName || "",
        });
      });
    } else {
      rows.push({
        ...baseRow,
        propertyName: "",
        originalValue: "",
        updatedValue: "",
        index: "",
        propertiesL1: "",
      });
    }
  }

  public getModifications() {
    return this.filteredModifications;
  }

  /**
   * Clear table data.
   */
  public clearModifications() {
    this.modifications = [];
    this.filteredModifications = [];
    this.searchText = "";
    this.errorMessage = "";
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Manual refresh from toolbar.
   */
  public refresh() {
    this.loadModificationReport();
  }

  /**
   * Apply search filter and sorting.
   * Search is **only** driven by user typing in the input;
   * we do NOT change searchText when selection changes.
   */
  public applyFilterAndSort() {
    let result = [...this.modifications];

    // Search filter
    if (this.searchText && this.searchText.trim() !== "") {
      const searchLower = this.searchText.toLowerCase().trim();
      result = result.filter((row) => {
        return (
          (row.date && row.date.toString().toLowerCase().includes(searchLower)) ||
          (row.version && row.version.toString().toLowerCase().includes(searchLower)) ||
          (row.user && row.user.toString().toLowerCase().includes(searchLower)) ||
          (row.objectId && row.objectId.toString().toLowerCase().includes(searchLower)) ||
          (row.objectName && row.objectName.toString().toLowerCase().includes(searchLower)) ||
          (row.state && row.state.toString().toLowerCase().includes(searchLower)) ||
          (row.parentObjectName && row.parentObjectName.toString().toLowerCase().includes(searchLower)) ||
          (row.elementClass && row.elementClass.toString().toLowerCase().includes(searchLower)) ||
          (row.subtype && row.subtype.toString().toLowerCase().includes(searchLower)) ||
          (row.crNumber && row.crNumber.toString().toLowerCase().includes(searchLower)) ||
          (row.justification && row.justification.toString().toLowerCase().includes(searchLower)) ||
          (row.propertyName && row.propertyName.toString().toLowerCase().includes(searchLower)) ||
          (row.originalValue && row.originalValue.toString().toLowerCase().includes(searchLower)) ||
          (row.updatedValue && row.updatedValue.toString().toLowerCase().includes(searchLower))
        );
      });
    }

    // Sorting
    if (this.sortColumn) {
      result.sort((a, b) => {
        let valueA = a[this.sortColumn] || "";
        let valueB = b[this.sortColumn] || "";

        if (this.sortColumn === "date") {
          valueA = valueA ? new Date(valueA).getTime() : 0;
          valueB = valueB ? new Date(valueB).getTime() : 0;
        } else {
          valueA = valueA.toString().toLowerCase();
          valueB = valueB.toString().toLowerCase();
        }

        if (valueA < valueB) {
          return this.sortDirection === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return this.sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    this.filteredModifications = result;
    this.changeDetectorRef.detectChanges();
  }

  /**
   * Bound to ngModelChange of search input.
   */
  public onSearchChange() {
    this.applyFilterAndSort();
  }

  /**
   * Handle column header click for sorting.
   */
  public sortBy(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = column;
      this.sortDirection = "asc";
    }
    this.applyFilterAndSort();
  }

  /**
   * Determine icon for given column.
   */
  public getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return "sort";
    }
    return this.sortDirection === "asc" ? "sort-up" : "sort-down";
  }

  /**
   * Row click navigation:
   * - resolve BO from objectId + elementClass
   * - call selectionService.selectObjects so SVG and Properties react
   * NOTE: This method does NOT touch the search box.
   */
  public onRowClick(row: any) {
    if (!row || !row.objectId || !row.elementClass) {
      return;
    }

    const project = this.modelService.getSelectedProject();
    if (!project) {
      return;
    }

    const bos = this.modelService.getObjectsByItemIdAndObjectClassNameList(project, [
      { itemId: String(row.objectId), objectClassName: row.elementClass },
    ]);

    if (bos && bos.length > 0) {
      this.selectionService.selectObjects(bos);
    }
  }
}

