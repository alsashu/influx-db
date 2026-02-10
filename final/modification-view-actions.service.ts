export class ModificationViewActionsService {
  public toolBarActions = {
    type: "tool-bar",
    actions: [
      {
        type: "btn-group",
        visible: (item: any) => true,
        actions: [
          {
            type: "button",
            html: (item: any) => "modification.view.clear.action",
            icon: (item: any) => "trash-alt",
            click: (event: any, item: any) => this.parent.clearModifications(),
            active: (item: any) => false,
            enabled: (item: any) => true,
            visible: (item: any) => true,
          },
          {
            type: "button",
            html: (item: any) => "modification.view.refresh.action",
            icon: (item: any) => "sync",
            click: (event: any, item: any) => this.parent.refresh(),
            active: (item: any) => false,
            enabled: (item: any) => true,
            visible: (item: any) => true,
          },
        ],
      },
    ],
  };

  constructor(private parent: any) {}
}
