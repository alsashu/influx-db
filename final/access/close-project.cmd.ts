import { AbstractCommand } from "../../common/services/command/commands/acommand";
import { ServicesConst } from "src/app/services/services/services.const";
import { IModelService } from "src/app/services/model/model.service";
import { ISelectionService } from "src/app/common/services/selection/selection.service";
import { IModelVerificationService } from "src/app/services/model/model-verification.service";
import { IModelLoadSaveService } from "src/app/services/model/model-load-save.service";
import { IModalViewService } from "src/app/services/modal/imodal-view.service";
import { IMessageService } from "src/app/services/message/message.service";

/**
 * Close selected project command
 */
export class CloseProjectCommand extends AbstractCommand {
  /**
   * Constructor
   */
  constructor() {
    super("Close Project");
  }

  /**
   * Execute the command
   * @returns False
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

      // Prompt user to save before closing
      modalViewService.openMessageModalComponent(
        {
          title: "Unsaved Changes",
          message: "You have unsaved changes. Save before leaving.",
          btnOKLabel: "Yes",
        },
        () => {
          // User clicked "Yes" - save then close
          modelLoadSaveService.saveSelectedProject().subscribe(
            () => {
              modelVerificationService.clearDirty();
              const messageService = this.servicesService.getService(
                ServicesConst.MessageService
              ) as IMessageService;
              messageService.addTextMessage("Verification data saved successfully.");
              this.doClose();
            },
            (error: any) => {
              console.error("[Verification] Save failed during close:", error);
              // Close anyway after error
              this.doClose();
            }
          );
        }
      );
    } else {
      this.doClose();
    }
    return false;
  }

  /**
   * Actually close the project
   */
  private doClose(): void {
    (this.servicesService.getService(ServicesConst.SelectionService) as ISelectionService).deselectAllObjects();
    (this.servicesService.getService(ServicesConst.ModelService) as IModelService).closeProject();
  }

  /**
   * Can execute the command
   * @returns Boolean value
   */
  public canExecute(): boolean {
    return (this.servicesService.getService(ServicesConst.ModelService) as IModelService).getSelectedProject();
  }
}
