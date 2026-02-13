import { AbstractCommand } from "../../common/services/command/commands/acommand";
import { ServicesConst } from "src/app/services/services/services.const";
import { IModelService } from "src/app/services/model/model.service";
import { IModelVerificationService } from "src/app/services/model/model-verification.service";
import { IModelLoadSaveService } from "src/app/services/model/model-load-save.service";
import { IModalViewService } from "src/app/services/modal/imodal-view.service";
import { IMessageService } from "src/app/services/message/message.service";

/**
 * Open project command
 */
export class OpenProjectCommand extends AbstractCommand {
  public params: any = {};

  /**
   * Constructor
   */
  constructor() {
    super("Open Project");
  }

  /**
   * Init function
   * @param params project
   * @returns
   */
  public init(params: any): OpenProjectCommand {
    this.params = params;
    return this;
  }

  /**
   * Execute command
   * @returns boolean
   */
  public execute(): boolean {
    const modelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;

    if (modelVerificationService && modelVerificationService.isDirty) {
      const modalViewService = this.servicesService.getService(
        ServicesConst.ModalViewService
      ) as IModalViewService;
      const modelLoadSaveService = this.servicesService.getService(
        ServicesConst.ModelLoadSaveService
      ) as IModelLoadSaveService;

      // Prompt user to save before opening another project
      modalViewService.openMessageModalComponent(
        {
          title: "Unsaved Changes",
          message: "You have unsaved changes. Save before leaving.",
          btnOKLabel: "Yes",
        },
        () => {
          // User clicked "Yes" - save then open
          modelLoadSaveService.saveSelectedProject().subscribe(
            () => {
              modelVerificationService.clearDirty();
              const messageService = this.servicesService.getService(
                ServicesConst.MessageService
              ) as IMessageService;
              messageService.addTextMessage("Verification data saved successfully.");
              this.doOpen();
            },
            (error: any) => {
              console.error("[Verification] Save failed during open project:", error);
              this.doOpen();
            }
          );
        }
      );
    } else {
      this.doOpen();
    }
    return false;
  }

  /**
   * Actually open the project
   */
  private doOpen(): void {
    const modelService = this.servicesService.getService(ServicesConst.ModelService) as IModelService;
    modelService.closeProject();
    if (this.params) {
      modelService.openProject(this.params.project);
    }
  }

  /**
   * Can execute
   * @returns true if can be executed
   */
  public canExecute(): boolean {
    return true;
  }

  /**
   * Get the command description
   * @returns
   */
  public getDescription(): string {
    let res = this.translateService.translateFromMap("Open Project");
    if (this.params && this.params.project && this.params.project.label) {
      res += " " + this.params.project.label;
    }
    return res;
  }
}
