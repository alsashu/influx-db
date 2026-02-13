import { AbstractCommand } from "../../common/services/command/commands/acommand";
import { ServicesConst } from "src/app/services/services/services.const";
import { IModelLoadSaveService } from "src/app/services/model/model-load-save.service";
import { IModelService } from "src/app/services/model/model.service";
import { IMvcService } from "src/app/services/mvc/imvc.service";
import { IMessageService } from "src/app/services/message/message.service";
import { ITranslateService } from "src/app/services/translate/translate.service";
import { IModelVerificationService } from "src/app/services/model/model-verification.service";

/**
 * Save project command
 */
export class SaveProjectCommand extends AbstractCommand {
  constructor() {
    super("Save Project");
  }

  /**
   * Execute command
   * @returns boolean
   */
  public execute(): boolean {
    const mvcService: IMvcService = this.servicesService.getService(ServicesConst.MvcService) as IMvcService;
    const messageService: IMessageService = this.servicesService.getService(
      ServicesConst.MessageService
    ) as IMessageService;
    const translateService: ITranslateService = this.servicesService.getService(
      ServicesConst.TranslateService
    ) as ITranslateService;
    const modelVerificationService: IModelVerificationService = this.servicesService.getService(
      ServicesConst.ModelVerificationService
    ) as IModelVerificationService;

    mvcService.startLoader();
    (this.servicesService.getService(ServicesConst.ModelLoadSaveService) as IModelLoadSaveService)
      .saveSelectedProject()
      .subscribe(
        (data: any) => {
          // Clear dirty flag after successful save
          modelVerificationService.clearDirty();
          messageService.addTextMessage(
            translateService.translateFromMap("Verification data saved successfully.")
          );
          mvcService.stopLoader();
        },
        (error: any) => {
          console.error("Error saving project:", error);
          messageService.addTextMessage(
            translateService.translateFromMap("Error during saving project:") + " " + (error ? error.message : "")
          );
          mvcService.stopLoader();
        },
        (data: any) => {
          mvcService.stopLoader();
        }
      );

    return false;
  }

  /**
   * Can execute
   * @returns true if can be executed
   */
  public canExecute(): boolean {
    return (this.servicesService.getService(ServicesConst.ModelService) as IModelService).getSelectedProject();
  }
}
