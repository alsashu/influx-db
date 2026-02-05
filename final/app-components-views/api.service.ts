import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { AppConfigService } from "../../services/app/app-config.service";
import { MvcService } from "../../services/mvc/mvc.service";
import { IServicesService } from "../services/iservices.service";
import { ServicesConst } from "../services/services.const";
import { ISessionService, SessionService } from "../session/session.service";
import { IInjectableUtilsService } from "../injectable/injectable-utils.service";
import { IOfflineApiService } from "../android/offline-api.service";
import { IWebsocketService } from "../websocket/websocket.service";

/**
 * Interface of the ApiService
 */
export interface IApiService {
  serverUrl: any;

  resetConnection();
  // setServerUrl(serverUrl: string);
  isServerLocalhost(): boolean;
  getIsOffLine(): boolean;

  getRightFromId(id: string): Promise<any>;
  getUserConfig(userId: string): Promise<any>;
  saveUserConfig(data: any): any;
  getRights(): Promise<any>;
  getUserInfo(params: any): any;
  addUser(newUser: any): any;

  // Rule engines
  executeCsRuleEngine(params: any): any;
  getCsRuleEngineLog(params: any): any;
  getCsRuleEngineLogs(params: any): any;
  executePythonRuleEngine(params: any): any;
  getPythonRuleEngineLog(params: any): any;
  getPythonRuleEngineLogs(params: any): any;

  lazyLoadData(projectId: string, id: string): Promise<any>;
  loadSvgFile(projectId: string, id: string): Promise<any>;

  getUser(userIdData: { userName: string; password: string }): Promise<any>;
  getKey(): Promise<any>;

  // Langage data from assets
  getLanguageMap(languageCode: string): any;

  loadFile(url: string, isJSON?: boolean): any;
  loadAssetFile(url: string, isJSON?: boolean): any;

  getProjectList(): Promise<any>;
  loadProjectFromId(id: string, saveOffline?: boolean): Promise<any>;

  saveInputAndSource(content: any, projectId: string, projectName: string, path: string, forceLocal?: boolean): any;
  getInputAndSource(projectId: string): Promise<any>;

  convertProject(): any;
  
  deleteProject(params: any): any;

  compareProjects(projectName1: string, projectName2: string, workspace: string): any;

  gitCloneProject(params: any): any;
  gitCheckoutProject(params: any): any;
  gitPushProject(params: any): any;
  executeGitCommand(params: any): any;

  uploadFile(file: any): any;
  uploadFileASync(file: any);
  finalizeProjectUpload(projectName: string): any;
  downloadProject(projectName: string, projectPath: string): any;

  getXmlFile(fileName: string): Promise<any>;
  getWikiPage(url: string): Promise<any>;
  buildWikiRailml(project: any, languageCode?: string, templateDir?: string): Promise<any>;
  searchWiki(searchOptions: any): Promise<any>;
  postWikiPage(url: string, content: string): any;

  saveWikiComment(data: any);
  getWikiComments(): any;
  getWikiCommentsByPage(currentPage: string): any;
  getWikiCommentById(id: string): any;
  getWikiPageCommentById(id: string, currentPage: string): any;
  putWikiComment(data: any);
  deleteWikiComment(id: string);
  deleteWikiPageComment(id: string, currentPage: string): any;

  getWikiCommentsBySelectedPage(current_page: string, language: string): any;
  deleteWikiSelectedPageComment(id: string, current_page: string, language: string): any;
  getWikiSelectedPageCommentById(id: string, current_page: string, language: string): any;

  setProjetIsDirty(projectId: string): any;
  getWikiPageComments(
    currentPage: string,
    language: string,
    dir: string,
    page: string
  ): any;

  getModificationReport(projectId: string, projectName: string): any;
}

/**
 * Api service to access server data through web services
 */
export class ApiService implements IApiService {
  public static localStorageName = "alm-rvw-api-service";

  private config: any = null;
  public serverUrl: string = null;
  public offline: boolean = false;
  private http: HttpClient;

  private injectableUtilsService: IInjectableUtilsService;
  private appConfigService: AppConfigService;
  private mvcService: MvcService;
  private sessionService: ISessionService;
  private offlineApiService: IOfflineApiService;
  private webSocketService: IWebsocketService;

  /**
   * Constructor
   * @param servicesService The services service
   */
  constructor(public servicesService: IServicesService) {
    this.injectableUtilsService = this.servicesService.getService(
      ServicesConst.InjectableUtilsService
    ) as IInjectableUtilsService;
    this.http = this.injectableUtilsService.httpClient;

    this.appConfigService = this.servicesService.getService(ServicesConst.AppConfigService) as AppConfigService;
    this.config = this.appConfigService.getConfig();
    this.serverUrl = this.config.SERVER_URL;
  }

  /**
   * Service init
   */
  public initService() {
    this.mvcService = this.servicesService.getService(ServicesConst.MvcService) as MvcService;
    this.sessionService = this.servicesService.getService(ServicesConst.SessionService) as ISessionService;
    this.offlineApiService = this.servicesService.getService(ServicesConst.OfflineApiService) as IOfflineApiService;
    this.webSocketService = this.servicesService.getService(ServicesConst.WebsocketService) as IWebsocketService;

    if (localStorage.getItem(ApiService.localStorageName)) {
      const lsData = JSON.parse(localStorage.getItem(ApiService.localStorageName));
      this.serverUrl = lsData;
      console.log("ApiService.init serverUrl =", this.serverUrl);
    } else {
      this.resetConnection();
    }
  }

  /**
   * Test if server is on local host
   * @returns
   */
  public isServerLocalhost(): boolean {
    return this.serverUrl.toUpperCase().includes("LOCALHOST");
  }

  /**
   * Reset connection
   */
  public resetConnection() {
    this.serverUrl = this.config.SERVER_URL;
    console.log("ApiService reset connection. serverUrl =", this.serverUrl);
    localStorage.removeItem(ApiService.localStorageName);
  }

  /**
   * Indiquates if offline or not
   * @returns Boolean
   */
  public getIsOffLine(): boolean {
    return this.webSocketService && this.webSocketService.getIsOffLine();
  }

  /**
   * Get data from server if connected and from local if off line (android)
   * @param url The url
   * @param httpOptions The http options
   * @returns Get promise
   */
  private getData(url: string, httpOptions: any = null, saveOffline: boolean = true): Promise<any> {
    if (!this.getIsOffLine()) {
      return this.getDataFromServer(url, httpOptions, saveOffline);
    } else {
      return this.offlineApiService.getData(url, httpOptions);
    }
  }

  /**
   * Get data from the server
   * @param url The url
   * @param httpOptions The http options
   * @returns Get promise
   */
  private getDataFromServer(url: string, httpOptions: any = null, saveOffline: boolean = true): Promise<any> {
    httpOptions = httpOptions || {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
      responseType: "json" as const,
    };
    url = this.serverUrl + url;
    return new Promise((resolve, reject) => {
      console.log("ApiService.getDataFromAPI url =", url);

      this.http
        .get<any[]>(url, httpOptions)
        .toPromise()
        .then(
          (res: any) => {
            console.log("ApiService.getDataFromAPI res =", res && res.toString ? res.toString().substring(1, 100) : "");

            // Refresh key and re send request
            if (Object.keys(res).includes("tokenExpired") && res["tokenExpired"] === true) {
              console.log(res["message"]);
              // const promise = this.refreshKey(url);
              // promise.then((res) => { resolve(res); })
            } else if (Object.keys(res).includes("success") && res["success"] === false) {
              console.log(res["message"]);
              // const promise = this.refreshKey(url);
              // promise.then((res) => { resolve(res); })
              resolve(res);
            } else {
              // Save data to local file system for offline mode
              if (saveOffline) {
                this.offlineApiService.saveDataFromApiCall("SERVER-DATA-GET-", url, httpOptions, res, true);
              }
              resolve(res);
            }
          },
          (msg) => {
            console.log("ApiService.getDataFromAPI " + msg);
            reject(msg);
          }
        );
    });
  }

  // /**
  //  * Refresh the key to access the server api
  //  * @param url Url
  //  * @param urlOptions Utl options
  //  * @returns Get promise
  //  */
  // private refreshKey(url: string, urlOptions: any) {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //     }),
  //     params: new HttpParams()
  //       .set("userName", sessionStorage.getItem(SessionService.sessionVar.userName))
  //       .set("password", sessionStorage.getItem(SessionService.sessionVar.password)),
  //     responseType: "json" as const,
  //   };
  //   return this.getDataFromServer(this.config.API_USERS + "logIn", httpOptions).then((res: any) => {
  //     this.sessionService.setCurrentUser(res);
  //     return this.getDataFromServer(url);
  //   });
  // }

  /**
   * Post data to server if online, save locally if off line (android)
   * @param url Api url
   * @param data Data
   * @param isJSON Boolean
   * @param httpOptions Http options
   * @returns Post promise
   */
  private postData(
    url: string,
    data: any,
    isJSON: boolean = true,
    httpOptions: any = null,
    forceLocal: boolean = false
  ): any {
    // Save data to local file system
    // TODO prevent offline erase
    // data = { data: content, projectId, projectName, path },
    let offLineUrl = url;
    // TODO Specific for offline url
    if (data) {
      if (data.projectId) {
        offLineUrl = url + "/?id=" + data.projectId;
      } else if (data.userId) {
        offLineUrl = url + "/?id=" + data.userId;
      }
    }
    const res = this.offlineApiService.saveDataFromApiCall("SAVED-DATA-POST-", offLineUrl, httpOptions, data, isJSON);

    console.log("forceLocal:", forceLocal, "getIsOffLine:", this.getIsOffLine());
    if (!forceLocal && !this.getIsOffLine()) {
      console.log("postDataToAPI:", url);
      return this.postDataToAPI(url, data, isJSON, httpOptions);
    }
    return res;

    // return new Observable((observer: any) => {
    //   observer.complete();
    // });
  }

  // TODO
  // Icon diff local/server to be added
  // x Move the tablet menu under project>
  // x Push the verification data to the server, add popup confirmation
  // Create backup on server in&src

  /**
   * Post data to the server
   * @param url Api url
   * @param data Data
   * @param isJSON Boolean
   * @param httpOptions Http options
   * @returns Post promise
   */
  private postDataToAPI(url: string, data: any, isJSON: boolean = true, httpOptions: any = null): any {
    httpOptions = httpOptions
      ? httpOptions
      : {
          headers: new HttpHeaders({
            "Content-Type": isJSON ? "application/json" : "text/plain",
            Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
          }),
          responseType: "text" as const,
        };
    if (!url.toLowerCase().includes("http")) {
      url = this.serverUrl + url;
    }
    return this.http.post(url, data, httpOptions);
  }

  /**
   * Get xml text file
   * @param fileName File name
   * @returns Get promise
   */
  public getXmlFile(fileName: string) {
    return this.getDataFromServer(this.config.API_XML + "/" + fileName, { responseType: "text" });
  }

  /**
   * Add a user
   * @param newUser New user
   * @returns Post promise
   */
  public addUser(newUser: any): any {
    return this.postDataToAPI(this.config.API_USERS + "signUp", newUser, true);
  }

  /**
   * Get right from id
   * @param id String id
   * @returns Get promise
   */
  public getRightFromId(id: string): Promise<any> {
    return this.getData(this.config.API_USERS + "right/" + id);
  }

  /**
   * Get user config
   * @param userId Id of the user
   * @returns Get promise
   */
  public getUserConfig(userId: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(new HttpParams().set("id", userId));
    return this.getData(this.config.API_USERS + "loadUserConfig", httpOptions);
  }

  /**
   * Save user config
   * @param data Data
   */
  public saveUserConfig(data: any) {
    this.postData(this.config.API_USERS + "saveUserConfig", data, true).subscribe();
  }

  /**
   * Get the rights
   * @returns Get promise
   */
  public getRights() {
    return this.getData(this.config.API_USERS + "rights");
  }

  /**
   * Execute right editor rule engine
   * @param params
   * @returns
   */
  public executeCsRuleEngine(params: any): any {
    return this.postData(this.config.API_CS_RULE_ENGINE, params, true);
  }

  /**
   * Execute python rule engine
   * @param params Parameters
   * @returns Post promise
   */
  public executePythonRuleEngine(params: any): any {
    return this.postData(this.config.API_PY_RULE_ENGINE, params, true);
  }

  /**
   * Get cs rule engine log
   * @param params Parameters
   * @returns Post promise
   */
  public getCsRuleEngineLog(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("projectId", params.projectId).set("userId", params.userId),
      false
    );
    return this.getData(this.config.API_CS_RULE_ENGINE_LOG_FILE, httpOptions);
  }

  /**
   * Get cs rule engine log
   * @param params Parameters
   * @returns Post promise
   */
  public getCsRuleEngineLogs(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("projectId", params.projectId).set("userId", params.userId)
    );
    return this.getData(this.config.API_CS_RULE_ENGINE_LOGS_FILE, httpOptions);
  }

  /**
   * Get python rule engine log
   * @param params Parameters
   * @returns Post promise
   */
  public getPythonRuleEngineLog(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("projectId", params.projectId).set("userId", params.userId),
      false
    );
    return this.getData(this.config.API_PY_RULE_ENGINE_LOG_FILE, httpOptions);
  }

  /**
   * Get python rule engine logs
   * @param params Parameters
   * @returns Post promise
   */
  public getPythonRuleEngineLogs(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("projectId", params.projectId).set("userId", params.userId)
    );
    return this.getData(this.config.API_PY_RULE_ENGINE_LOG_FILES, httpOptions);
  }

  /**
   * Git clone a project
   * @param params gitUrl
   * @returns A promise. API res with result, message and branches
   */
  public gitCloneProject(params: any): any {
    const httpOptions = this.getGetHttpOptions(new HttpParams().set("gitUrl", params.gitUrl));
    return this.getData(this.config.API_GIT_CLONE_PROJECT, httpOptions);
  }

  /**
   * Git checkout
   * @param params gitUrl and branch
   * @returns A promise. API res with result, message
   */
  public gitCheckoutProject(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("gitUrl", params.gitUrl).set("branch", params.branch)
    );
    return this.getData(this.config.API_GIT_CHECKOUT_PROJECT, httpOptions);
  }

  /**
   * Execute a git command
   * @param params path
   * @returns A promise
   */
  public gitPushProject(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("path", params.path).set("token", params.token).set("userName", params.userName)
    );
    return this.getData(this.config.API_GIT_PUSH_PROJECT, httpOptions);
  }

  /**
   * Execute a git command
   * @param params command & projectName
   * @returns A promise
   */
  public executeGitCommand(params: any): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("command", params.command).set("projectName", params.projectName)
    );
    return this.getData(this.config.API_GIT_COMMAND, httpOptions);
  }

  /**
   * Lazy load json data
   * @param projectId Project id
   * @param id data id (file name)
   * @returns Get promise
   */
  public lazyLoadData(projectId: string, id: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(new HttpParams().set("id", id).set("projectId", projectId));
    return this.getData(this.config.API_MODEL_LAZYLOADING, httpOptions);
  }

  /**
   * Lazy load svg text file
   * @param projectId Project id
   * @param svgFileName data id (file name)
   * @returns Get promise
   */
  public loadSvgFile(projectId: string, svgFileName: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("svgFileName", svgFileName).set("projectId", projectId),
      false
    );
    return this.getData(this.config.API_MODEL_SVG, httpOptions);
  }

  /**
   * Get http options for get api call
   * @param isJson
   * @param params
   * @returns
   */
  private getGetHttpOptions(params: any = new HttpParams(), isJson: boolean = true): any {
    let httpOptions: any = null;
    if (isJson) {
      httpOptions = {
        headers: null,
        params,
        responseType: "json" as const,
      };
    } else {
      httpOptions = {
        headers: null,
        params,
        responseType: "text",
      };
    }
    httpOptions.headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
    });
    return httpOptions;
  }

  /**
   * Upload a file
   * @param file The file
   */
  public uploadFile(file: any): any {
    const formData = new FormData();
    formData.append("fileData", file);
    formData.append("filePath", file.webkitRelativePath);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    };
    return this.http.post(this.serverUrl + this.config.API_UPLOAD_FILE, formData, httpOptions).toPromise();
  }

  /**
   * Upload a file
   * @param file The file
   */
  public async uploadFileASync(file: any) {
    try {
      const formData = new FormData();
      formData.append("fileData", file);
      formData.append("filePath", file.webkitRelativePath);
      const httpOptions = {
        headers: new HttpHeaders({
          Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
      };
      await this.http.post(this.serverUrl + this.config.API_UPLOAD_FILE, formData, httpOptions).toPromise();
      console.log("File " + file.webkitRelativePath + " uploaded");
    } catch (ex) {
      console.log("uploadFileWait exception:", ex);
    }
  }

  /**
   * Finalize project upload after files downloading done
   * @param projectName The name of the project
   * @returns api promise
   */
  public finalizeProjectUpload(projectName: string): any {
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    };
    return this.http.post(this.serverUrl + this.config.API_UPLOAD_PROJECT, { projectName }, httpOptions).toPromise();
  }

  /**
   * Download a project
   * @param file The project data
   */
  public downloadProject(projectName: string, projectPath: string): any {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("projectName", projectName).set("projectPath", projectPath)
    );
    return this.getDataFromServer(this.config.API_DOWNLOAD_PROJECT, httpOptions);
  }

  /**
   * Get user data
   * @param userIdData : userName, password
   * @returns Get promise
   */
  public getUser(userIdData: { userName: string; password: string }): Promise<any> {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams().set("userName", userIdData.userName).set("password", userIdData.password)
    );
    return this.getData(this.config.API_USERS + "logIn", httpOptions);
  }

  /**
   * Get user key
   * @returns Get promise
   */
  public getKey(): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
      params: new HttpParams(),
      responseType: "json" as const,
    };
    return this.getData(this.config.API_USERS + "key", httpOptions);
  }

  /**
   * Get language map
   * @param languageCode Language code
   * @returns Get promise
   */
  public getLanguageMap(languageCode: string): any {
    return this.loadAssetFile("assets/i18n/" + languageCode + ".json");
  }

  /**
   * Load an asset file
   * @param url Url
   * @param isJSON Boolean value
   * @returns Get promise
   */
  public loadFile(url: string, isJSON: boolean = true): any {
    return this.loadAssetFile(url, isJSON);
  }

  /**
   * Load an asset file
   * @param url Url
   * @param isJSON Boolean value
   * @returns Get promise
   */
  public loadAssetFile(url: string, isJSON: boolean = true): any {
    const httpOptions: any = isJSON
      ? {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
          responseType: "json" as const,
        }
      : { responseType: "text" };
    return this.http.get<any[]>(url, httpOptions);
  }

  // /**
  //  * Get the xsd model
  //  * @returns Get promise
  //  */
  // public getXsdModel(): Promise<any> {
  //   return this.getData(this.config.API_METAMODEL + "xsd");
  // }

  /**
   * Get the list of projects
   * @returns Get promise
   */
  public getProjectList(): Promise<any> {
    return this.getData(this.config.API_PROJECT_LIST);
  }

  /**
   * Load a project from the id of the project
   * @param id Project id
   * @returns Get promise
   */
  public loadProjectFromId(id: string, saveOffline: boolean = true): Promise<any> {
    const httpOptions = this.getGetHttpOptions(new HttpParams().set("id", id));
    return this.getData(this.config.API_PROJECT, httpOptions, saveOffline);
  }

  /**
   * Save input and source
   * @param content Content
   * @param projectId Project id
   * @param projectName Project name
   * @param path Path of the project
   * @returns Post promise
   */
  public saveInputAndSource(
    content: any,
    projectId: string,
    projectName: string,
    path: string,
    forceLocal: boolean = false
  ): any {
    return this.postData(
      this.config.API_MODEL_VERIF,
      { data: content, projectId, projectName, path },
      true,
      null,
      forceLocal // TODO
    );
  }

  public getInputAndSource(projectId: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(new HttpParams().set("id", projectId));
    return this.getData(this.config.API_MODEL_VERIF, httpOptions);
  }

  /**
   * Convert projects
   * @returns Post promise
   */
  public convertProject(): any {
    return this.postData(this.config.API_CONVERT_PROJECT, {});
  }

  /**
   * Get modification report for a project
   * @param projectId The project ID
   * @param projectName The project name
   * @returns Promise with modification report data
   */
  public getModificationReport(projectId: string, projectName: string): any {
    const url = this.config.API_MODIFICATION_REPORT + projectId + "/" + projectName;
    return this.getData(url);
  }

  

  /**
   * Delete a project
   * @param params projectId, projectName
   * @returns Post promise
   */
  public deleteProject(params: any): any {
    const body = { projectId: params.projectId, projectName: params.projectName };
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
      responseType: "json" as const,
    };
    return this.postData(this.config.API_PROJECT_DELETE, body, true, httpOptions);
  }

  /**
   * Compare projects and get diff result
   * @param projectName Project name
   * @param projectNamePrevious Previous project name
   * @returns Get promise
   */
  public compareProjects(projectName: string, projectNamePrevious: string, workspace: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams()
        .set("projectName", projectName)
        .set("projectNamePrevious", projectNamePrevious)
        .set("workspace", workspace)
    );
    return this.getData(this.config.API_PROJECT_COMPARE, httpOptions);
  }

  /**
   * Get a wiki text page
   * @param url Relative url of the page
   * @returns Get promise
   */
  public getWikiPage(url: string): Promise<any> {
    return this.getData(this.config.API_WIKI_PAGES + url, { responseType: "text" });
    // return this.getDataFromServer(this.config.API_WIKI_PAGES + url, { responseType: "text" });
  }

  /**
   * Build instanciated doc of a project
   * @param project The project
   * @param languageCode The language
   * @param templateDir The dir of the wiki pages template
   * @returns Get promise
   */
  public buildWikiRailml(project: any, languageCode?: string, templateDir?: string): Promise<any> {
    const httpOptions = this.getGetHttpOptions(
      new HttpParams()
        .set("projectId", project.label)
        .set("languageCode", languageCode ? languageCode : "en-US")
        .set("templateDir", templateDir)
    );
    return this.getData(this.config.API_WIKI_BUILD_RAILML, httpOptions);
  }

  /**
   * Search in wiki pages
   * @param searchOptions Search options
   * @returns Get promise
   */
  public searchWiki(searchOptions: any): Promise<any> {
    return this.getDataFromServer(
      this.config.API_WIKI_SEARCH +
        `?searchString=${searchOptions.searchString}&languageCode=${searchOptions.languageCode}`,
      {
        responseType: "json",
      }
    );
  }

  /**
   * Save a wiki page
   * @param url Url of the page
   * @param content Text content of the page
   */
  public postWikiPage(url: string, content: string): any {
    const body = { url, content };
    this.postData(this.config.API_WIKI_PAGE, body).subscribe();
  }

  /**
   * Get user info from user management
   * @param params token
   * @returns Post promise
   */
  public getUserInfo(params: any): any {
    const body = {};
    const httpOptions = {
      headers: new HttpHeaders({
        token: params.token,
      }),
      responseType: "json" as const,
    };
    return this.postData(this.config.API_USER_MNGT_AUTH_LOGIN, body, true, httpOptions);
  }

  // public saveWikiComment(data: any) {
  //   this.postData(this.config.API_COMMENT + "postWikiComment", data, true).subscribe();
  // }

  // public getWikiComments(): Promise<any> {
  //   return this.getDataFromServer(this.config.API_COMMENT + "getWikiComments", {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //   });
  // }

  // public getWikiCommentsByPage(current_page: string): Promise<any> {
  //   return this.getDataFromServer(this.config.API_COMMENT + "getWikiComments/" + current_page, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //   });
  // }

  // public postComment(comment: any): any {
  //   console.log("logIn");
  //   return this.postData(this.config.API_COMMENT + "postWikiComments", comment, true);
  // }

  // public getWikiCommentById(id: string): any {
  //   return this.getData(this.config.API_COMMENT + "getWikiCommentById/" + id, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //     //params: new HttpParams().set("id", id),
  //   });
  // }

  // public getWikiPageCommentById(id: string, current_page: string): any {
  //   return this.getData(this.config.API_COMMENT + "getWikiCommentById/" + id + "/" + current_page, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //     //params: new HttpParams().set("id", id),
  //   });
  // }

  // public putWikiComment(data: any) {
  //   this.postData(this.config.API_COMMENT + "editWikiComment", data, true).subscribe();
  // }

  // public deleteWikiComment(id: string) {
  //   this.getData(this.config.API_COMMENT + "deleteWikiComment/" + id, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //   }).then((data) => {
  //     console.log("Deleted comment: ", data);
  //   });
  // }

  // public deleteWikiPageComment(id: string, current_page: string) {
  //   this.getData(this.config.API_COMMENT + "deleteWikiComment/" + id + "/" + current_page, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //   }).then((data) => {
  //     console.log("Deleted comment: ", data);
  //   });
  // }

  public getWikiCommentsBySelectedPage(current_page: string, language: string): Promise<any> {
    return this.getDataFromServer(this.config.API_COMMENT + "getWikiComments/" + current_page + "/" + language, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    });
  }

  // public deleteWikiSelectedPageComment(id: string, current_page: string, language: string) {
  //   this.getData(this.config.API_COMMENT + "deleteWikiComment/" + id + "/" + language + "/" + current_page, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //   }).then((data) => {
  //     console.log("Deleted comment: ", data);
  //   });
  // }

  // public getWikiSelectedPageCommentById(id: string, current_page: string, language: string): any {
  //   return this.getData(this.config.API_COMMENT + "getWikiCommentById/" + id + "/" + language + "/" + current_page, {
  //     headers: new HttpHeaders({
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //     }),
  //     //params: new HttpParams().set("id", id),
  //   });
  // }

  // /**
  //    * Retrieves comments for a specific wiki page based on the current page, language, directory, and page name.
  //    * @param currentPage - The current page of the wiki.
  //    * @param language - The language of the wiki.
  //    * @param dir - The directory of the wiki page.
  //    * @param page - The name of the wiki page.
  //    * @returns Returns the comments for the specified wiki page.
  //    */
  // public getWikiPageComments(
  //         currentPage: string,
  //         language: string,
  //         dir: string,
  //         page: string
  //       ): Promise<any> {
  //         const httpOptions = {
  //           headers: new HttpHeaders({
  //             "Content-Type": "application/json",
  //             Authorization:
  //               "Bearer " +
  //               sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
  //           }),
  //           params: new HttpParams()
  //             .set("currentPage", currentPage)
  //             .set("language", language)
  //             .set("dir", dir)
  //             .set("page", page),
  //         };
  //         return this.getDataFromServer(this.config.API_WIKI_COMMENT, httpOptions);
  // }

   /**
   * Saves a wiki comment.
   * @param data - The data to save as a wiki comment.
   */
   public saveWikiComment(data: any) {
    this.postData(
      this.config.API_WIKI_COMMENT + "/save",
      data,
      true
    ).subscribe();
  }

  /**
   * Retrieves all wiki comments.
   * @returns Returns all wiki comments.
   */
  public getWikiComments(): Promise<any> {
    return this.getDataFromServer(this.config.API_COMMENT + "getWikiComments", {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer " +
          sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    });
  }

  /**
   * Retrieves wiki comments by the current page.
   * @param current_page - The current page of the wiki.
   * @returns Returns the wiki comments for the specified page.
   */
  public getWikiCommentsByPage(current_page: string): Promise<any> {
    return this.getDataFromServer(
      this.config.API_COMMENT + "getWikiComments/" + current_page,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
      }
    );
  }

  /**
   * Posts a comment to the wiki.
   * @param comment - The comment to post.
   * @returns Returns the result of the post operation.
   */
  public postComment(comment: any): any {
    console.log("logIn");
    return this.postData(
      this.config.API_COMMENT + "postWikiComments",
      comment,
      true
    );
  }

  /**
   * Retrieves a wiki comment by its ID.
   * @param id - The ID of the wiki comment.
   * @returns Returns the wiki comment with the specified ID.
   */
  public getWikiCommentById(id: string): any {
    return this.getData(this.config.API_COMMENT + "getWikiCommentById/" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer " +
          sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    });
  }

  /**
   * Retrieves a wiki page comment by its ID and the current page.
   * @param id - The ID of the wiki comment.
   * @param current_page - The current page of the wiki.
   * @returns Returns the wiki page comment with the specified ID and current page.
   */
  public getWikiPageCommentById(id: string, current_page: string): any {
    return this.getData(
      this.config.API_COMMENT + "getWikiCommentById/" + id + "/" + current_page,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
      }
    );
  }

  /**
   * Updates a wiki comment with the provided data.
   * @param data - The data to update the wiki comment with.
   */
  public putWikiComment(data: any) {
    this.postData(
      this.config.API_WIKI_COMMENT + "/modify",
      data,
      true
    ).subscribe();
  }

  /**
   * Deletes a wiki comment by its ID.
   * @param id - The ID of the wiki comment to delete.
   */
  public deleteWikiComment(id: string) {
    this.getData(this.config.API_COMMENT + "deleteWikiComment/" + id, {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer " +
          sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
    }).then((data) => {
      console.log("Deleted comment: ", data);
    });
  }

  /**
   * Deletes a wiki page comment by its ID and the current page.
   * @param id - The ID of the wiki comment to delete.
   * @param current_page - The current page of the wiki.
   */
  public deleteWikiPageComment(id: string, current_page: string) {
    this.getData(
      this.config.API_WIKI_PAGE +
        "deleteWikiComment/" +
        id +
        "/" +
        current_page,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
      }
    ).then((data) => {
      console.log("Deleted comment: ", data);
    });
  }

  /**
   * Retrieves comments for a specific wiki page based on the current page, language, directory, and page name.
   * @param currentPage - The current page of the wiki.
   * @param language - The language of the wiki.
   * @param dir - The directory of the wiki page.
   * @param page - The name of the wiki page.
   * @returns Returns the comments for the specified wiki page.
   */
  public getWikiPageComments(
    currentPage: string,
    language: string,
    dir: string,
    page: string
  ): Promise<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer " +
          sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
      params: new HttpParams()
        .set("currentPage", currentPage)
        .set("language", language)
        .set("dir", dir)
        .set("page", page),
    };
    return this.getDataFromServer(this.config.API_WIKI_COMMENT, httpOptions);
  }

  /**
   * Deletes a wiki comment for the selected page and language.
   * @param id - The ID of the wiki comment to delete.
   * @param currentPage - The current page of the wiki.
   * @param language - The language of the wiki.
   * @returns Returns the result of the deletion operation.
   */
  public deleteWikiSelectedPageComment(
    id: string,
    currentPage: string,
    language: string
  ) {
    try {
      const httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
        params: new HttpParams()
          .set("id", id)
          .set("currentPage", currentPage)
          .set("language", language),
      };
      return this.getDataFromServer(
        this.config.API_WIKI_COMMENT + "/delete",
        httpOptions
      );
    } catch (error) {
      console.log("Error deleting comment: ", error);
    }
  }

  /**
   * Retrieves a wiki comment by its ID for the selected page and language.
   * @param id - The ID of the wiki comment.
   * @param currentPage - The current page of the wiki.
   * @param language - The language of the wiki.
   * @returns Returns the wiki comment data.
   */
  public getWikiSelectedPageCommentById(
    id: string,
    currentPage: string,
    language: string
  ): any {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization:
          "Bearer " +
          sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
      }),
      params: new HttpParams()
        .set("currentPage", currentPage)
        .set("language", language),
    };
    return this.getDataFromServer(
      this.config.API_WIKI_COMMENT + "/" + id,
      httpOptions
    );
  }

  /**
   * Deletes a wiki page by its language, directory, and page name.
   * @param language - The language of the wiki page.
   * @param dir - The directory of the wiki page.
   * @param wikiPage - The name of the wiki page to delete.
   */
  public deleteWikiPage(language: string, dir: string, wikiPage: string) {
    this.getData(
      this.config.API_WIKI_PAGE +
        "/delete/" +
        language +
        "/" +
        dir +
        "/" +
        wikiPage,
      {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
      }
    ).then((data) => {
      console.log("Deleted page: ", data);
    });
  }

  /**
   * Removes a wiki page by its path.
   * @param path - The path of the wiki page to remove.
   * @returns Returns the result of the removal operation.
   */
  public removeWikiPage(path: string) {
    try {
      const httpOptions = {
        headers: new HttpHeaders({
          "Content-Type": "application/json",
          Authorization:
            "Bearer " +
            sessionStorage.getItem(SessionService.sessionVar.authorizationKey),
        }),
        params: new HttpParams().set("path", path),
      };
      return this.getDataFromServer(
        this.config.API_WIKI_PAGE + "/remove",
        httpOptions
      );
    } catch (error) {
      console.log("Error deleting comment: ", error);
    }
  }

  /**
   * Set project isDirty on tablet
   * @param projectId Project id
   * @returns
   */
  public setProjetIsDirty(projectId: string): any {
    return this.postData(this.config.API_MODEL_ISDIRTY, { projectId }, true, null, true);
  }
}
