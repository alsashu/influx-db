export class ViewConfigService {
  public defaultConfig: any = {
    disabled: false,
    gutterSize: 15,
    type: "split-area",
    splitDirection: "horizontal",
    splitAreas: [
      {
        // left panel
        visible: true,
        size: 30,
        type: "split-area",
        splitDirection: "vertical",
        splitAreas: [
          {
            visible: true,
            size: 50,
            type: "view-container",
            label: "Projects",
            config: {
              views: [{ type: "model-view", title: "Projects", icon: "file" }],
            },
          },
          {
            visible: true,
            size: 50,
            type: "view-container",
            label: "Properties",
            config: {
              views: [{ type: "properties-view", title: "Properties", icon: "table" }],
            },
          },
        ],
      },
      {
        visible: true,
        size: 50,
        type: "split-area",
        splitDirection: "vertical",
        splitAreas: [
          // main panel
          {
            visible: true,
            size: 75,
            type: "split-area",
            isMainViewSplitArea: true,

            label: "Main",
            splitDirection: "vertical",
            splitAreas: [
              {
                visible: true,
                size: 50,
                type: "view-container",
                label: "Main view container 1",
                isMainViewContainer: true,
                config: {
                  isMainView: true,
                  views: [],
                },
              },
            ],
          },
          // bottom panel
          {
            visible: true,
            size: 25,
            type: "view-container",
            label: "Messages",
            config: {
              multiView: true,
              views: [
                { type: "verification-view", title: "Verification", icon: "check" },
                { type: "compare-view", title: "Comparison", icon: "code-compare" },
                { type: "rule-view", title: "Rules", icon: "gear" },
                { type: "search-view", title: "Search", icon: "loupe" },
                { type: "message-view", title: "Messages", icon: "mail" },
                { type: "modification-view", title: "Modification", icon: "pen-to-square" },
              ],
            },
          },
        ],
      },
      {
        // right panel
        visible: true,
        size: 20,
        type: "split-area",
        splitDirection: "vertical",
        splitAreas: [
          {
            visible: true,
            size: 100,
            type: "view-container",
            label: "Library",
            config: {
              views: [{ type: "library-view", title: "Library", icon: "cubes" }],
            },
          },
        ],
      },
    ],
  };
}
