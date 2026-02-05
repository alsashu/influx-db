import { logService } from "../log/log.service";
import { IServiceManager } from "../service/service.manager";
import { ConfigService } from "../config/config.service";
import { AService } from "../service/aservice";
import { IWebServerService } from "../server/web-server.service";
import { IAcadLibraryService } from "../acad-library/acad-library.service";
import { RailMLImportService } from "../railml-import/railml-import.service";
import { v4 as uuid } from "uuid";
import fs from "fs-extra";
import path from "path";
import xml2js from "xml2js";
import rimraf from "rimraf";
import { AuthenticateService } from "../authenticate/authenticate.service";
import { isPropertyName } from "typescript";

/**
 * Interface of ConvertFileService
 */
export interface IConvertFileService {
  convertInputSourceAndStateFiles(projectName: string, projectFolder: string, outputPath: string);
  convertDataHistoryFiles(projectName: string, projectFolder: string, outputPath: string);
  convertProjectOrProjects(projectName: string, res?: any);
  getRightEditorProjectDataFromFolder(name: string, path: string): any;
  getProjectsData(): any;
}

/**
 * Service designed for right editor project convertion to right viewer project format (json files)
 */
export class ConvertFileService extends AService implements IConvertFileService {
  private rootDir: string;
  private dataDir = "/data/";
  private xsdFileName = "data.json";
  private sourceAndStateFolder = "sourceAndState/";
  private sourceAndStateExtension = ".insrc.xml";

  private modificationReportFolder = "modificationReport/";
  private modificationReportExtension = ".mod.xml";

  private stringPropertyList = [
    "verificationComment",
    "verificationCR",
    "verificationInputDocument",
    "verificationDocument",
    "verificationResponseComment",
    "verificationResponseCheck",
  ];

  private stringMaxLength = 500;

  private configService: ConfigService;
  private serverService: IWebServerService;
  private acadLibraryService: IAcadLibraryService;
  private railMLImportService: RailMLImportService;
  private authenticateService: AuthenticateService;

  /**
   * Constructor
   * @param serviceManager Service manager
   */
  constructor(serviceManager: IServiceManager) {
    super("ConvertFileService", serviceManager);
  }

  /**
   * Service init
   * @returns this
   */
  public init() {
    logService.log("[ConvertFileService] Init");
    this.configService = this.serviceManager.getService("ConfigService") as ConfigService;
    this.serverService = this.serviceManager.getService("WebServerService") as IWebServerService;
    this.acadLibraryService = this.serviceManager.getService("AcadLibraryService") as IAcadLibraryService;
    this.railMLImportService = this.serviceManager.getService("RailMLImportService") as RailMLImportService;
    this.authenticateService = this.serviceManager.getService("AuthenticateService") as AuthenticateService;

    this.dataDir = this.configService.config.dataFolder;
    this.rootDir = this.configService.rootDir;
    this.initWS();
    return this;
  }

  /**
   * Init web services
   */
  private initWS() {
    const app = this.serverService.app;
    const boundAuthenticate = this.authenticateService.authenticateKey.bind(this.authenticateService);

    app.post("/api/convert/right_viewer_format/:projectName?", boundAuthenticate, (req: any, res: any, next: any) => {
      this.convertProjectOrProjects(req.params.projectName, res);
    });

    app.get("/api/convert/getProjects", boundAuthenticate, (req: any, res: any, next: any) => {
      const projectsData = this.getProjectsData();
      res.send({
        result: "ok",
        rightEditorProjects: projectsData.rightEditorProjects,
        convertedProjects: projectsData.convertedProjects,
      });
    });

    app.get("/api/convert/getModificationReport/:projectId/:projectName?", boundAuthenticate, (req: any, res: any, next: any) => {     
      this.getModificationData(req.params.projectId, req.params.projectName, res);
    });
  }



  /**
   * Get projects data
   * @returns rightEditorProjects && convertedProjects
   */
  public getProjectsData(): any {
    const rightEditorProjectPath = this.rootDir + this.dataDir + "right_projects/";
    const gitRightEditorProjectsFolder = this.rootDir + this.dataDir + "right_projects_from_git/";
    const rightViewerProjectPath = this.rootDir + this.dataDir + "right_viewer_projects/";
    const rightEditorProjects = this.readRightEditorProjects(rightEditorProjectPath, gitRightEditorProjectsFolder);
    const convertedProjects = this.readConvertedProjects(rightViewerProjectPath);
    return { rightEditorProjects, convertedProjects };
  }

  /**
   * Get Modification Data
   */
  public getModificationData(projectId: string, projectName:string, res: any = null):any{
    try {
      if (!projectId || !projectName) {
        res.status(400).send({ result: "error", message: "Missing projectId or projectName parameter" });
        return;
      }

      const rightViewerProjectPath = this.rootDir + this.dataDir + "right_viewer_projects/";
      const modificationReportPath = rightViewerProjectPath + projectId + "/" + this.modificationReportFolder + projectName + ".json";

      if (!fs.existsSync(modificationReportPath)) {
        res.status(404).send({ result: "error", message: "Modification report not found" });
        return;
      }

      const modificationReport = JSON.parse(fs.readFileSync(modificationReportPath, "utf-8"));
      res.send({ result: "ok", modificationReport });
    } catch (ex) {
      logService.error(`[ConvertFileService] (/api/convert/getModificationReport) exception ${ex}`);
      res.status(500).send({ result: "exception", message: ex.message });
    }
  }

  /**
   * Convert one project or all projects non yet converted
   * @param projectName The project name or null or "none"
   * @param res Web service res
   */
  public convertProjectOrProjects(projectName: string, res: any = null) {
    try {
      const rightEditorProjectPath = this.rootDir + this.dataDir + "right_projects/";
      const gitRightEditorProjectsFolder = this.rootDir + this.dataDir + "right_projects_from_git/";
      const rightViewerProjectPath = this.rootDir + this.dataDir + "right_viewer_projects/";
      const convertedProjects = this.readConvertedProjects(rightViewerProjectPath);

      if (!projectName || projectName === "none") {
        const rightEditorProjects = this.readRightEditorProjects(rightEditorProjectPath, gitRightEditorProjectsFolder);
        this.convertProjects(rightEditorProjects, convertedProjects, rightViewerProjectPath);
      } else {
        const rightEditorProjectData = this.getRightEditorProjectDataFromFolder(projectName, rightEditorProjectPath);
        const previousProject = convertedProjects.find((p: any) => p.projectName === projectName && p.branch === null);
        if (previousProject) {
          rimraf(rightViewerProjectPath + previousProject.id, () => {
            logService.log("[ConvertFileService] Cleaning of previous converted project done");
          });
        }
        this.convertProject(rightEditorProjectData, rightViewerProjectPath);
      }
      logService.log(`[ConvertFileService] (/api/convert/right_viewer_format/)`);
      if (res) {
        res.send({ result: "ok" });
      }
    } catch (ex) {
      logService.error(`[ConvertFileService] (/api/convert/right_viewer_format/:projectId) exception ${ex}`);
      if (res) {
        res.send({ result: "exception", ex });
      }
    }
  }

  /**
   * Read converted projects
   * @param rightViewerProjectPath The right viewer projects folder
   * @returns The list of converted projects
   */
  public readConvertedProjects(rightViewerProjectPath: string): any[] {
    const convertedProjects = [];

    fs.readdirSync(rightViewerProjectPath).forEach((id: string) => {
      try {
        if (fs.statSync(rightViewerProjectPath + "/" + id).isDirectory()) {
          const project = JSON.parse(fs.readFileSync(rightViewerProjectPath + id + "/" + id + ".json", "utf-8"));
          if (project) {
            convertedProjects.push({
              label: project.label,
              projectName: project.projectName ? project.projectName : project.label,
              id,
              branch: project.branch ? project.branch : null,
            });
          }
        }
      } catch (ex) {
        logService.error("[ConvertFileService]", ex);
      }
    });
    return convertedProjects;
  }

  /**
   * Read converted projects
   * @param rightViewerProjectPath The right viewer projects folder
   * @returns The list of converted projects
   */
  public readRightEditorProjects(rightEditorProjectPath: string, gitRightEditorProjectsFolder: string): any[] {
    const rightEditorProjects = [];
    try {
      if (rightEditorProjectPath) {
        fs.readdirSync(rightEditorProjectPath).forEach((name: string) => {
          const rightEditorProjectData = this.getRightEditorProjectDataFromFolder(name, rightEditorProjectPath);
          if (rightEditorProjectData) {
            rightEditorProjects.push(rightEditorProjectData);
          }
        });
      }
    } catch (ex) {
      logService.error("[ConvertFileService]", ex);
    }
    try {
      if (gitRightEditorProjectsFolder) {
        fs.readdirSync(gitRightEditorProjectsFolder).forEach((projectName: string) => {
          if (fs.statSync(gitRightEditorProjectsFolder + projectName).isDirectory()) {
            fs.readdirSync(gitRightEditorProjectsFolder + projectName).forEach((branch: string) => {
              if (fs.statSync(gitRightEditorProjectsFolder + projectName + "/" + branch).isDirectory()) {
                fs.readdirSync(gitRightEditorProjectsFolder + projectName + "/" + branch).forEach((name: string) => {
                  if (
                    fs.statSync(gitRightEditorProjectsFolder + projectName + "/" + branch + "/" + name).isDirectory() &&
                    name === projectName
                  ) {
                    let rightEditorProjectData = this.getRightEditorProjectDataFromFolder(
                      projectName,
                      gitRightEditorProjectsFolder + projectName + "/" + branch + "/"
                    );
                    if (rightEditorProjectData) {
                      rightEditorProjectData.branch = branch;
                      rightEditorProjects.push(rightEditorProjectData);
                    }
                  }
                });
              }
            });
          }
        });
      }
    } catch (ex) {
      logService.error("[ConvertFileService]", ex);
    }

    // console.log(rightEditorProjects);
    return rightEditorProjects;
  }

  /**
   * Get right editor project data from a folder
   * @param name Folder name
   * @param path Path
   * @returns Project data
   */
  public getRightEditorProjectDataFromFolder(name: string, path: string): any {
    let res = null;
    if (fs.statSync(path + name).isDirectory()) {
      const railMlFileName = this.railMLImportService.getRailmlFileName(name, path + name + "/");
      if (railMlFileName) {
        res = {
          projectName: name,
          railMlFileName,
          path: path,
          branch: null,
        };
      }
    }
    return res;
  }

  /**
   * Convert a project
   * @param rightEditorProjects The list of right editor projects
   * @param convertedProjects The list of converted projects
   * @param rightViewerProjectPath The path of the converted project
   */
  public convertProjects(rightEditorProjects: any[], convertedProjects: any[], rightViewerProjectPath: string) {
    try {
      logService.log("[ConvertFileService] convertProjects");
      const projectsToBeConverted = rightEditorProjects.filter(
        (rightEditorProject: any) =>
          !convertedProjects.find(
            (rvProject: any) =>
              rvProject.projectName === rightEditorProject.projectName && rvProject.branch === rightEditorProject.branch
          )
      );

      const projectNameList = [];
      projectsToBeConverted.forEach((rightEditorProject: any) => {
        projectNameList.push(
          rightEditorProject.projectName + (rightEditorProject.branch ? "_" + rightEditorProject.branch : "")
        );
      });
      this.serverService.wsSendAll({ type: "ConvertProjectsStart", projectsToBeConverted, projectNameList });

      if (projectsToBeConverted.length) {
        projectsToBeConverted.forEach((rightEditorProject: any) => {
          logService.log("[ConvertFileService] Converting project:", rightEditorProject.projectName);
          this.serverService.wsSendAll({ type: "ConvertintProject", rightEditorProject });
          this.convertProject(rightEditorProject, rightViewerProjectPath);
        });
      } else {
        logService.log("[ConvertFileService] No project to be converted");
      }

      this.serverService.wsSendAll({ type: "ConvertProjectsEnd", projectsToBeConverted });
    } catch (e) {
      logService.error(e);
    }
  }

  /**
   * Convert a project
   * @param rightEditorProjectData The right editor project data
   * @param projectPath The path of the converted project
   * @param projectId id of the rv format project. If null, a uuid is set.
   */
  public convertProject(rightEditorProjectData: any, rightViewerProjectsPath: string, projectId: string = null) {
    if (rightEditorProjectData && rightEditorProjectData.railMlFileName) {
      const projectName = rightEditorProjectData.projectName;
      const rightEditorProjectPath = rightEditorProjectData.path + projectName + "/";

      projectId = projectId || uuid();
      const projectPath = rightViewerProjectsPath + projectId;

      // Create the project folder
      this.createFolder(projectPath);

      // // Convert librairies
      // this.acadLibraryService.createLibFromAcadLibrary(rightEditorProjectPath, projectPath + "/");
      // logService.log(`[ConvertFileService] Library converted`);

      // // Convert railMl_xsd files
      // this.convertXsdFiles(rightEditorProjectPath + "/RailML_XSD/", projectPath + "/xsd/");
      // logService.log(`[ConvertFileService] Xsd files converted`);

      // Convert project file from xml to json
      this.railMLImportService.convertRailML2Json(rightEditorProjectData, projectPath + "/", projectId);
      logService.log(`[ConvertFileService] Railml converted`);

      // Copy svg files
      this.copySvgFiles(rightEditorProjectPath, projectPath + "/");
      logService.log(`[ConvertFileService] SVG files copied`);

      // Convert railMl_xsd files
      this.convertXsdFiles(rightEditorProjectPath + "/RailML_XSD/", projectPath + "/xsd/");
      logService.log(`[ConvertFileService] Xsd files converted`);

      // Convert tcfg files
      this.convertProjectConfigFiles(rightEditorProjectPath, projectPath + "/");
      logService.log(`[ConvertFileService] Project config files converted`);

      // Convert insrc files
      this.convertInputSourceAndStateFiles(projectName, rightEditorProjectPath, projectPath + "/");
      logService.log(`[ConvertFileService] Input and source file converted`);

      // Convert data history files
      this.convertDataHistoryFiles(projectName, rightEditorProjectPath, projectPath + "/");
      logService.log(`[ConvertFileService] Data history files converted`);

      // Convert librairies
      this.acadLibraryService.createLibFromAcadLibrary(rightEditorProjectPath, projectPath + "/");
      logService.log(`[ConvertFileService] Library converted`);

      // Done
      logService.log(`[ConvertFileService] Project converted (id = ${projectId})`);
    } else {
      logService.log(
        `[ConvertFileService] Project not converted. There is no valid railml or xml file (project name = ${rightEditorProjectData.projectName})`
      );
    }
  }

  /**
   * Test if the foldes=r exist and create it if it doesn't
   * @param path
   */
  public createFolder(path: string) {
    fs.mkdir(path, (e: any) => {
      if (!e || (e && e.code === "EEXIST")) {
      }
    });
  }

  /**
   * Rename the target file, usually it is a automatically generated file
   * @param path File path
   * @param newName New name
   */
  public renameFile(path: string, newName: string) {
    fs.rename(path, newName, (err: any) => {
      if (err) {
        logService.log("ERROR: " + err);
      }
    });
  }

  /**
   * Function that create a file with the filename, fill it with content and save it in the outputpath
   * @param fileName The file name
   * @param content The content to be written
   * @param outputPath The output folder
   */
  public writeFile(fileName: string, content: string, outputPath: string) {
    logService.log("[ConvertFileService] WriteFile " + fileName);
    const filePath = outputPath + fileName;
    fs.writeFileSync(filePath, content, "utf-8");
  }

  /**
   * Function that clean the transformation of a xml file to a json file
   * @param data Xml data
   * @returns The objects from xml
   */
  public cleanXmlToJson(data: any): any {
    const res = { type: Object.keys(data)[0] };
    this.railMLImportService.createObjectFromXmlObjectRecV4(res, data, res.type);
    return res;
  }

  /**
   * Function that convert xsd files into json
   * @param directory The directory with input files
   * @param output Target folder
   * @returns The list of the config files
   */
  public convertXsdFiles(directory: string, output: string): any {
    const res = {};
    const dir = directory;
    fs.readdirSync(dir).forEach((file: string) => {
      try {
        if (fs.statSync(dir + file).isFile() && ![".SHA"].includes(path.extname(file).toUpperCase())) {
          const xsdFileContent = fs.readFileSync(dir + file, "utf-8");
          res[file] = xsdFileContent;
        }
      } catch (ex) {
        logService.error("[ConvertFileService] EXCEPTION", ex);
      }
    });
    if (output) {
      fs.mkdir(output, (e) => {
        if (!e || (e && e.code === "EEXIST")) {
          fs.writeFile(output + this.xsdFileName, JSON.stringify(res, null, "  "), (err: any) => {
            if (err) {
              logService.log("[ConvertFileService] Xsd conversion error ");
            } else {
              logService.log("[ConvertFileService] File saved ");
            }
          });
        } else {
          logService.log(e);
        }
      });
    }
    return res;
  }

  /**
   * Function that convert tcfg files into json, for project configuration
   * @param projectFolder The directory with input files
   * @param outputPath Target folder
   */
  public convertProjectConfigFiles(projectFolder: string, outputPath: string) {
    const configFolder = "projectConfig/";
    this.createFolder(outputPath + configFolder);
    fs.readdirSync(projectFolder).forEach((file: string) => {
      if (file.includes(".tcfg") && !file.includes(".sha")) {
        this.convertTcfgFiles(projectFolder, file, outputPath + configFolder);
      }
    });
  }

  /**
   * Function that read a tcfg file and convert it in a json file
   * @param path The path of the config files
   * @param filename The name of the file
   * @param outputpath Target folder
   */
  public convertTcfgFiles(path: string, filename: string, outputpath: string) {
    let res = [];
    try {
      const file = path + filename;
      const xmlRailml = fs.readFileSync(file, "utf-8");
      xml2js.parseString(xmlRailml, (err: any, data: any) => {
        if (err) {
          logService.dir("[ConvertFileService] ConvertTcfgFiles err =", err);
        } else {
          res = this.cleanXmlToJson(data);
        }
      });
      const content = JSON.stringify(res, null, "  ");
      this.writeFile(filename.replace(".tcfg", ".json"), content, outputpath);
    } catch (ex) {
      logService.error("[ConvertFileService] Import EXCEPTION ", ex);
    }
  }

  /**
   * Function that converts or creates the verification file if the project doesn't have one yet
   * @param projectName The name of the project
   * @param projectFolder The folder of the project
   * @param outputPath The output folder
   */
  public convertInputSourceAndStateFiles(projectName: string, projectFolder: string, outputPath: string) {
    this.createFolder(outputPath + this.sourceAndStateFolder);
    this.convertSourceAndStateFile(
      projectFolder,
      projectName + this.sourceAndStateExtension,
      outputPath + this.sourceAndStateFolder
    );
  }

  /**
   * Convert data history files
   * @param projectName The name of the project
   * @param projectFolder The folder of the project
   * @param outputPath The output folder
   */
  public convertDataHistoryFiles(projectName: string, projectFolder: string, outputPath: string) {
    this.createFolder(outputPath + this.modificationReportFolder);
    this.convertDataHistoryFile(
      projectFolder,
      projectName + this.modificationReportExtension,
      outputPath + this.modificationReportFolder
    );
  }

  /**
   * Convert data history file
   * @param path The path of the file
   * @param filename The file name
   * @param outputpath The output path
   */
  public convertDataHistoryFile(path: string, filename: string, outputpath: string) {
    let res = null;
    try {
      const file = path + filename;
      const xmlRailml = fs.readFileSync(file, "utf-8");
      xml2js.parseString(xmlRailml, (err: any, data: any) => {
        if (err) {
          logService.dir("[ConvertFileService] ConvertDataHistoryFile err =", err);
        } else {
          res = this.cleanXmlToJson(data);
        }
      });
      const content = JSON.stringify(res, null, "  ");
      this.writeFile(filename.replace(".mod.xml", ".json"), content, outputpath);
    } catch (ex) {
      logService.error("[ConvertFileService] ConvertDataHistoryFile EXCEPTION", ex);
    }
  }

  /**
   * Convert source and state file
   * @param path The path of the file
   * @param filename The file name
   * @param outputpath The output path
   */
  public convertSourceAndStateFile(path: string, filename: string, outputpath: string) {
    let res = null;
    try {
      const file = path + filename;
      if (!fs.existsSync(file)) {
        logService.log("[ConvertFileService] No input source and state file found. Create a new one.");
        res = {
          type: "inputSourceAndState",
          inputSourceAndState: {
            type: "inputSourceAndState",
            label: "inputSourceAndState",
            elementTypes: [],
          },
        };
      } else {
        const xmlRailml = fs.readFileSync(file, "utf-8");
        xml2js.parseString(
          xmlRailml,
          {
            attrValueProcessors: [
              (value: any, name: string) => {
                if (name.indexOf("Date") >= 0) {
                  if (typeof value === "string" && value.indexOf("T") > -1) {
                    value = new Date(Date.parse(value)).getTime();
                  }
                }
                return value;
              },
            ],
          },
          (err: any, data: any) => {
            if (err) {
              logService.dir("[ConvertFileService] ConvertSourceAndStateFile err =", err);
            } else {
              res = this.cleanXmlToJson(data);
            }
          }
        );
      }
      this.cleanInputAndSource(res);

      const content = JSON.stringify(res, null, "  ");
      this.writeFile(filename.replace(".insrc.xml", ".json"), content, outputpath);
    } catch (ex) {
      logService.error("[ConvertFileService] ConvertSourceAndStateFile EXCEPTION", ex);
    }
  }

  /**
   * Clean input and source before converting to xml
   * @param insrc input and source data
   * @returns Cleaned data
   */
  private cleanInputAndSource(insrc: any): any {
    if (insrc && insrc.inputSourceAndState && insrc.inputSourceAndState.elementTypes) {
      if (!insrc.inputSourceAndState.elementTypes.forEach) {
        insrc.inputSourceAndState.elementTypes = [insrc.inputSourceAndState.elementTypes];
      }
      insrc.inputSourceAndState.elementTypes.forEach((elementType: any) => {
        this.cleanElement(elementType);
        if (elementType.elements) {
          if (!elementType.elements.forEach) {
            elementType.elements = [elementType.elements];
          }
          elementType.elements.forEach((element: any) => {
            this.cleanElement(element);

            const ev = element.elementVerification;
            if (ev) {
              this.cleanVerificationObject(ev);
            }
            if (element.property) {
              if (!element.property.forEach) {
                element.property = [element.property];
              }
              element.property.forEach((ppt: any) => {
                this.cleanElement(ppt);
                delete ppt.id;
              });
            }
            if (element.propertiesDescription) {
              if (!element.propertiesDescription.forEach) {
                element.propertiesDescription = [element.propertiesDescription];
              }
              const cleanPropertyDescriptionList = [];
              element.propertiesDescription.forEach((pd: any) => {
                if (pd && pd.propertyName.indexOf(":") > 0) {
                  this.cleanElement(pd);
                  delete pd.id;

                  if (pd.propertyVerification && pd.propertyVerification.forEach) {
                    pd.propertyVerification = pd.propertyVerification.find((e: any) => true);
                  }
                  if (pd.propertyVerification) {
                    this.cleanVerificationObject(pd.propertyVerification);
                  }

                  // Remove property verification with default values
                  const pv = pd.propertyVerification;
                  const pc = Object.keys(pv).length;
                  const notVerifiedProp =
                    pc === 4 &&
                    pv["verificationState"] === "Not Verified" &&
                    pv["verificationRulesState"] === "Not Verified" &&
                    pv["verificationOverallState"] === "Not Verified" &&
                    pv["xmlType"] === "propertyVerification";
                  if (notVerifiedProp) {
                    delete pd.propertyVerification;
                  }

                  cleanPropertyDescriptionList.push(pd);
                }
                element.propertiesDescription = cleanPropertyDescriptionList;
              });
            }
          });
        }
      });
    }
    return insrc;
  }

  private cleanElement(element: any) {
    if (element) {
      // delete element.id;
      delete element.label;
      delete element.type;
    }
  }

  /**
   * Clean a verification object (elementVerification or propertyVerification)
   * @param verification
   */
  private cleanVerificationObject(verification: any) {
    if (verification) {
      delete verification.id;
      this.cleanElement(verification);

      this.stringPropertyList.forEach((propertyName: string) => {
        this.truncateStringProperty(verification, propertyName, this.stringMaxLength);
      });

      // delete verification.label;
      // delete verification.type;
      // this.createUndefinedProperty(verification, "verificationComment", "");
      // this.createUndefinedProperty(verification, "verificationCorrectionDate", null);
      // this.createUndefinedProperty(verification, "verificationCorrectionUser", null);
      // this.createUndefinedProperty(verification, "verificationCR", "");
      // this.createUndefinedProperty(verification, "verificationDate", null);
      // this.createUndefinedProperty(verification, "verificationDocument", "");
      // this.createUndefinedProperty(verification, "verificationInputDocument", "");
      // this.createUndefinedProperty(verification, "verificationResponseCheck", "");
      // this.createUndefinedProperty(verification, "verificationResponseComment", "");
      // this.createUndefinedProperty(verification, "verificationResponseDate", null);
      // this.createUndefinedProperty(verification, "verificationResponseState", "");
      // this.createUndefinedProperty(verification, "verificationResponseUser", null);
      // this.createUndefinedProperty(verification, "verificationState", "");
      // this.createUndefinedProperty(verification, "verificationUser", null);
      // this.createUndefinedProperty(verification, "verificationRulesState", "");
      // this.createUndefinedProperty(verification, "verificationOverallState", "");
    }
  }

  /**
   * Truncate too long string
   */
  private truncateStringProperty(object: any, propertyName: string, maxLength: number = 500) {
    if (object && typeof object[propertyName] === "string" && object[propertyName].length > maxLength) {
      object[propertyName] = object[propertyName].substring(0, maxLength);
    }
  }

  /**
   * Create undefined property and set to a specific value
   * @param o The object
   * @param propertyName The property name
   * @param value The value
   */
  private createUndefinedProperty(o: any, propertyName: string, value: any) {
    if (o && o[propertyName] === undefined) {
      o[propertyName] = value;
    }
  }

  /**
   * Copy svg diagrams
   * @param path The path of the file
   * @param outputpath The output path
   */
  public copySvgFiles(path: string, outputpath: string) {
    const svgFolder = "svg/";
    this.createFolder(outputpath + svgFolder);

    if (fs.existsSync(path + svgFolder)) {
      fs.readdirSync(path + svgFolder).forEach((file: string) => {
        if (fs.statSync(path + svgFolder + file).isFile()) {
          try {
            logService.log("[ConvertFileService] Copying SVG file", file);
            fs.copySync(path + svgFolder + file, outputpath + svgFolder + file);
          } catch (ex) {
            logService.error("[ConvertFileService]", ex);
          }
        }
      });
    }
  }
}
