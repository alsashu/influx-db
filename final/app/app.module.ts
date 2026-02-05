import localeFr from "@angular/common/locales/fr";
registerLocaleData(localeFr);
import localeEs from "@angular/common/locales/es";
registerLocaleData(localeEs);
import localeIt from "@angular/common/locales/it";
registerLocaleData(localeIt);
import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from "@angular/platform-browser";
import { NgModule, Injectable, LOCALE_ID, importProvidersFrom } from "@angular/core";
import { NgbModule, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from "./app.component";
import { AngularSplitModule } from "angular-split";
import { ContextMenuModule } from "ngx-contextmenu";
import { AceEditorModule } from "ng2-ace-editor";
import { FontAwesomeModule, FaIconLibrary } from "@fortawesome/angular-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import { Draggable, Droppable } from "./directives/dragdrop";
import { NgxUiLoaderModule, NgxUiLoaderConfig, SPINNER, PB_DIRECTION } from "ngx-ui-loader";
import * as Hammer from "hammerjs";
import { NavbarComponent } from "./components/app/navbar/navbar.component";
import { WorkspaceComponent } from "./components/app/workspace/workspace.component";
import { ViewContainerComponent } from "./components/app/view-container/view-container.component";
import { ViewPanelComponent } from "./components/app/view-panel/view-panel.component";
import { GenericContextMenuComponent } from "./components/app/generic-context-menu/generic-context-menu.component";
import { GenericToolBarComponent } from "./components/app/generic-tool-bar/generic-tool-bar.component";
import { GenericTreeComponent } from "./components/app/generic-tree/generic-tree.component";
import { TreeTableComponent } from "./components/app/tree-table/tree-table.component";
import { ToolTipComponent } from "./components/app/tool-tip/tool-tip.component";
import { PropertiesComponent } from "./components/app/properties/properties.component";
import { MessagePopupComponent } from "./components/app/message-popup/message-popup.component";
import { TopButtonComponent } from "./components/app/top-button/top-button.component";
import { TopPanelComponent } from "./components/app/top-panel/top-panel.component";
import { ModelViewComponent } from "./components/views/model-view/model-view.component";
import { PropertiesViewComponent } from "./components/views/properties-view/properties-view.component";
import { TextViewComponent } from "./components/views/text-view/text-view.component";
import { LibraryViewComponent } from "./components/views/library-view/library-view.component";
import { TestViewComponent } from "./components/views/test-view/test-view.component";
import { RuleViewComponent } from "./components/views/rule-view/rule-view.component";
import { WikiViewComponent } from "./components/views/wiki-view/wiki-view.component";
import { MessageViewComponent } from "./components/views/message-view/message-view.component";
import { VerificationViewComponent } from "./components/views/verification-view/verification-view.component";
import { TextModalComponent } from "./components/modal/text-modal/text-modal.component";
import { FormModalComponent } from "./components/modal/form-modal/form-modal.component";
import { MessageModalComponent } from "./components/modal/message-modal/message-modal.component";
import { VerificationModalComponent } from "./components/modal/verification-modal/verification-modal.component";
import { DiagramComponent } from "./modules/diagram/components/diagram/diagram.component";
import { GraphicViewComponent } from "./components/views/graphic-view/graphic-view.component";
import { DiagramLayerPanelComponent } from "./modules/diagram/components/panels/diagram-layer-panel/diagram-layer-panel.component";
import { MouseWheelDirective } from "./modules/diagram/directives/mousewheel.directive";
import { AppRoutingModule } from "./app-routing.module";
import { RouterModule } from "@angular/router";
import { PageContainerComponent } from "./components/app/page-container/page-container.component";
import { LogInPageComponent } from "./components/pages/login-page/logIn-page.component";
import { MainPageComponent } from "./components/pages/main-page/main-page.component";
import { VerificationTreeItemComponent } from "./components/views/verification-view/verification-tree-item/verification-tree-item.component";
import { StatusBarComponent } from "./components/app/status-bar/status-bar.component";
import { TableTreeItemComponent } from "./components/views/table-view/table-tree-item/table-tree-item.component";
import { TableViewComponent } from "./components/views/table-view/table-view.component";
import { SearchViewComponent } from "./components/views/search-view/search-view.component";
import { SvgDefComponent } from "./modules/diagram/components/svg-def/svg-def.component";
import { SearchTreeItemComponent } from "./components/views/search-view/search-tree-item/search-tree-item.component";
import { CommonModule, registerLocaleData } from "@angular/common";
import { SvgViewComponent } from "./components/views/svg-view/svg-view.component";
import { SvgDiagramComponent } from "./modules/svg-diagram/components/svg-diagram/svg-diagram.component";
import { SvgDiagramTooltipComponent } from "./modules/svg-diagram/components/svg-diagram-tooltip/svg-diagram-tooltip.component";
import { WikiComponent } from "./components/views/wiki-view/wiki/wiki.component";
import { IomappingViewComponent } from "./components/views/iomapping-view/iomapping-view.component";
import { RackTreeItemComponent } from "./components/views/iomapping-view/rack-tree-item/rack-tree-item.component";
import { VerificationTooltipComponent } from "./components/views/verification-view/verification-tooltip/verification-tooltip.component";
import { SearchOptionsModalComponent } from "./components/modal/search-options-modal/search-options-modal.component";
import { GitModalComponent } from "./components/modal/git-modal/git-modal.component";
import { CompareViewComponent } from "./components/views/compare-view/compare-view.component";
import { CompareTreeItemComponent } from "./components/views/compare-view/compre-tree-item/compare-tree-item.component";
import { ModificationViewComponent } from "./components/views/modification-view/modification-view.component";
import { SvgDiagramLayerPanelComponent } from "./components/views/svg-view/svg-diagram-layer-panel/svg-diagram-layer-panel.component";
import { UploadProjectModalComponent } from "./components/modal/upload-project-modal/upload-project-modal.component";
import { EquipmentTreeItemComponent } from "./components/views/iomapping-view/equipment-tree-item/equipment-tree-item.component";
import { CompareProjectsModalComponent } from "./components/modal/compare-projects-modal/compare-projects-modal.component";
import { WikiCommentPanelComponent } from "./components/views/wiki-view/wiki-comment-panel/wiki-comment-panel.component";

@Injectable()
export class MyGestureConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL, enable: true },
    pinch: { enable: true },
  } as any;
  buildHammer(element: HTMLElement) {
    const mc = new (window as any).Hammer(element);
    return mc;
  }
}

const ngxUiLoaderConfig: NgxUiLoaderConfig = {
  fgsType: SPINNER.ballSpinClockwise,
  pbDirection: PB_DIRECTION.leftToRight,
  pbThickness: 3,
};

// tslint:disable-next-line: max-classes-per-file
@NgModule({
  declarations: [
    Draggable,
    Droppable,
    MouseWheelDirective,
    AppComponent,
    NavbarComponent,
    WorkspaceComponent,
    ViewContainerComponent,
    ViewPanelComponent,
    GenericContextMenuComponent,
    GenericToolBarComponent,
    GenericTreeComponent,
    TreeTableComponent,
    ToolTipComponent,
    PropertiesComponent,
    MessagePopupComponent,
    StatusBarComponent,
    TopButtonComponent,
    TopPanelComponent,
    ModelViewComponent,
    PropertiesViewComponent,
    TextViewComponent,
    LibraryViewComponent,
    TestViewComponent,
    WikiViewComponent,
    RuleViewComponent,
    MessageViewComponent,
    VerificationViewComponent,
    VerificationTreeItemComponent,
    TableViewComponent,
    TableTreeItemComponent,
    SearchViewComponent,
    SearchTreeItemComponent,
    GraphicViewComponent,
    DiagramComponent,
    SvgDefComponent,
    DiagramLayerPanelComponent,
    SvgViewComponent,
    SvgDiagramComponent,
    SvgDiagramTooltipComponent,
    SvgDiagramLayerPanelComponent,
    TextModalComponent,
    FormModalComponent,
    MessageModalComponent,
    VerificationModalComponent,
    SearchOptionsModalComponent,
    GitModalComponent,
    UploadProjectModalComponent,
    PageContainerComponent,
    LogInPageComponent,
    MainPageComponent,
    WikiComponent,
    IomappingViewComponent,
    RackTreeItemComponent,
    VerificationTooltipComponent,
    CompareViewComponent,
    CompareTreeItemComponent,
    ModificationViewComponent,
    EquipmentTreeItemComponent,
    CompareProjectsModalComponent,
    WikiCommentPanelComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    FontAwesomeModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSplitModule.forRoot(),
    ContextMenuModule.forRoot({
      useBootstrap4: true,
    }),
    AceEditorModule,
    HttpClientModule,
    NgxUiLoaderModule.forRoot(ngxUiLoaderConfig),
    RouterModule,
  ],
  providers: [
    NgbActiveModal,
    importProvidersFrom(HammerModule),
    // { provide: HAMMER_GESTURE_CONFIG, useClass: MyGestureConfig },
    { provide: LOCALE_ID, useValue: "en-US" },
    { provide: LOCALE_ID, useValue: "fr" },
    { provide: LOCALE_ID, useValue: "fr-FR" },
    { provide: LOCALE_ID, useValue: "esp" },
    { provide: LOCALE_ID, useValue: "it" },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
    library.addIconPacks(far);
  }
}
