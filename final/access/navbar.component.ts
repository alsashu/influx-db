import { Component, OnInit } from "@angular/core";
import { IViewService } from "../../../services/view/view.service";
import { IApiService } from "src/app/services/api/api.service";
import { IWebsocketService } from "src/app/services/websocket/websocket.service";
import { ServicesService } from "src/app/services/services/services.service";
import { ICommandService } from "src/app/common/services/command/command.service";
import { ServicesConst } from "src/app/services/services/services.const";
import { Router } from "@angular/router";
import { IUserService } from "src/app/services/user/user.service";
import { ITranslateService } from "src/app/services/translate/translate.service";
import { IAppConfigService } from "src/app/services/app/app-config.service";
import { IModalViewService } from "src/app/services/modal/imodal-view.service";
import { IAndroidService } from "src/app/services/android/android.service";
import { IModelVerificationService } from "src/app/services/model/model-verification.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
  host: { class: "navbar navbar-expand-sm navbar-dark fixed-top" },
})
/**
 * Nav bar component
 */
export class NavbarComponent implements OnInit {
  public isCollapsed = true;

  public serverUrl: string;

  public connectedStatus = $localize`:@@navbar.connected:Connected to server`;
  public notConnectedStatus = $localize`:@@navbar.notConnected:Not connected to server`;
  public offlineStatus = $localize`:@@navbar.offline:Offline`;

  public commandService: ICommandService;
  public viewService: IViewService;
  public apiService: IApiService;
  public websocketService: IWebsocketService;
  public userService: IUserService;
  public translateService: ITranslateService;
  public modalViewService: IModalViewService;
  public androidService: IAndroidService;
  public appConfigService: IAppConfigService;
  public modelVerificationService: IModelVerificationService;

  /**
   * Constructor
   * @param servicesService The services service
   * @param router The router
   */
  constructor(public servicesService: ServicesService, public router: Router) {}

  /**
   * Init
   */
  public ngOnInit() {
    this.commandService = this.servicesService.getService(ServicesConst.CommandService) as ICommandService;
    this.viewService = this.servicesService.getService(ServicesConst.ViewService) as IViewService;
    this.apiService = this.servicesService.getService(ServicesConst.ApiService) as IApiService;
    this.websocketService = this.servicesService.getService(ServicesConst.WebsocketService) as IWebsocketService;
    this.translateService = this.servicesService.getService(ServicesConst.TranslateService) as ITranslateService;
    this.modalViewService = this.servicesService.getService(ServicesConst.ModalViewService) as IModalViewService;
    this.userService = this.servicesService.getService(ServicesConst.UserService) as IUserService;
    this.androidService = this.servicesService.getService(ServicesConst.AndroidService) as IAndroidService;
    this.appConfigService = this.servicesService.getService(ServicesConst.AppConfigService) as IAppConfigService;

    this.modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;

    this.serverUrl = this.apiService.serverUrl;
  }

  /**
   * Toggle auto-save enabled/disabled
   */
  public onAutoSaveToggle(): void {
    this.modelVerificationService.setAutoSaveEnabled(!this.modelVerificationService.isAutoSaveEnabled);
  }

  /**
   * Handle auto-save interval change
   * @param event The input event
   */
  public onAutoSaveIntervalChange(event: any): void {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      this.modelVerificationService.setAutoSaveIntervalMinutes(value);
    }
  }

  /**
   * Get server tooltip
   * @returns
   */
  public getServerTooltip(): string {
    let s = "";
    if (this.websocketService.getIsOffLine()) {
      s = this.translateService.translateFromMap(this.offlineStatus);
    } else {
      const status = this.websocketService.isConnected ? this.connectedStatus : this.notConnectedStatus;
      s = this.translateService.translateFromMap(status) + " (" + this.serverUrl + ")";
    }
    return s;
  }
}
