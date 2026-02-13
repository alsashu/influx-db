import { Component, OnInit, HostListener, OnDestroy } from "@angular/core";
import { ServicesService } from "./services/services/services.service";
import { ServicesFactory } from "./services/services/services.factory";
import { ITranslateService } from "./services/translate/translate.service";
import { ServicesConst } from "./services/services/services.const";
import { IMessageService } from "./services/message/message.service";
import { IAppConfigService } from "./services/app/app-config.service";
import { IModelVerificationService } from "./services/model/model-verification.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
/**
 * App Component
 */
export class AppComponent implements OnInit, OnDestroy {
  private translateService: ITranslateService;
  private messageService: IMessageService;
  public appConfigService: IAppConfigService;
  private modelVerificationService: IModelVerificationService;

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(private servicesService: ServicesService) {
    this.buildServices();
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.messageService = this.servicesService.getService(ServicesConst.MessageService) as IMessageService;
    this.appConfigService = this.servicesService.getService(ServicesConst.AppConfigService) as IAppConfigService;
    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;
  }

  /**
   * Component init
   */
  public ngOnInit() {
    this.messageService.addTextMessage(
      this.translateService.translateFromMap("Welcome to the RIGHT VIEWER") + " " + this.appConfigService.getVersion()
    );
  }

  /**
   * ngOnDestroy
   */
  public ngOnDestroy() {}

  /**
   * Build the services
   */
  private buildServices() {
    new ServicesFactory().buildServices(this.servicesService);
    this.servicesService.initServices();
  }

  /**
   * Disable html page zoom events
   * @param event Event
   */
  @HostListener("wheel", ["$event"])
  public wheelEvent(event: any) {
    if (event.ctrlKey || event.altKey) {
      event.preventDefault();
    }
  }

  /**
   * Remove default context menu
   * @param event Event
   * @returns False
   */
  @HostListener("contextmenu", ["$event"])
  public contextMenuEvent(event: any): boolean {
    event.preventDefault();
    return false;
  }

  /**
   * Ask confirmation if closing browser tab or browser window when there are unsaved verification changes.
   * The browser shows its own native dialog; we cannot customize the message in modern browsers,
   * but setting returnValue and calling preventDefault() is required to trigger it.
   * @param event: any
   */
  @HostListener("window:beforeunload", ["$event"])
  public unload(event: any) {
    if (this.modelVerificationService && this.modelVerificationService.isDirty) {
      // Standard way to trigger the browser's native "unsaved changes" dialog
      event.preventDefault();
      event.returnValue = "You have unsaved changes. Save before leaving.";
    }
  }
}
