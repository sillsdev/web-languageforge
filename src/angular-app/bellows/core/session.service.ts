import * as angular from 'angular';

import { ProjectSettings } from '../shared/model/project-settings.model';
import { Project } from '../shared/model/project.model';
import { ApiService, JsonRpcCallback } from './api/api.service';
import {ExceptionHandlingService} from './exception-handling.service';

export class Session {
  constructor(public data?: SessionData) { }

  userId(): string {
    return this.data.userId;
  }

  fileSizeMax(): number {
    return this.data.fileSizeMax;
  }

  baseSite(): string {
    return this.data.baseSite;
  }

  projectSettings<T extends ProjectSettings>(): T {
    return this.data.projectSettings as T;
  }

  project<T extends Project>(): T {
    return this.data.project as T;
  }

  username(): string {
    return this.data.username;
  }

  accessToken(): string {
    return this.data.accessToken;
  }

  hasSiteRight(domain: RightsFunction, operation: RightsFunction): boolean {
    return this.hasRight(this.data.userSiteRights, domain, operation);
  }

  hasProjectRight(domain: RightsFunction, operation: RightsFunction): boolean {
    return this.hasRight(this.data.userProjectRights, domain, operation);
  }

  hasRight(rights: any, domain: RightsFunction, operation: RightsFunction): boolean {
    if (!rights) return false;
    const right = domain() + operation();
    return rights.indexOf(right) !== -1;
  }

  getProjectSetting(setting: string) {
    return this.data.projectSettings[setting];
  }
}

export type SessionCallback = (session: Session) => void;

class SessionData {
  userId: string;
  fileSizeMax: number;
  baseSite: string;
  projectSettings: ProjectSettings;
  project: Project;
  username: string;
  userSiteRights: any;
  userProjectRights: any;
  userProjectRole: string;
  userIsProjectMember: boolean;
  accessToken: string;
  version: string;
}

export type RightsFunction = () => number;

export class Domains {
  ANY: RightsFunction;
  USERS: RightsFunction;
  PROJECTS: RightsFunction;
  TEXTS: RightsFunction;
  QUESTIONS: RightsFunction;
  ANSWERS: RightsFunction;
  COMMENTS: RightsFunction;
  TEMPLATES: RightsFunction;
  TAGS: RightsFunction;
  ENTRIES: RightsFunction;
}

export class Operations {
  CREATE: RightsFunction;
  EDIT: RightsFunction;
  DELETE: RightsFunction;
  LOCK: RightsFunction;
  VIEW: RightsFunction;
  VIEW_OWN: RightsFunction;
  EDIT_OWN: RightsFunction;
  DELETE_OWN: RightsFunction;
  ARCHIVE: RightsFunction;
}

// Because session data is asynchronously loaded, it is not possible to synchronously
// obtain a reference to the session instance. getSession() must be called, which returns
// a promise (callbacks also accepted) that resolves to the session instance, which can
// then be used synchronously.
export class SessionService {
  domain: Domains;
  operation: Operations;

  private session: Session;
  private sessionDataPromise: angular.IPromise<SessionData>;

  static $inject: string[] = ['apiService', '$q', 'exceptionHandler'];
  constructor(private api: ApiService, private $q: angular.IQService,
              private exceptionHandler: ExceptionHandlingService) {
    const domains: Domains = {
      ANY:       this.rightsFunction(1000),
      USERS:     this.rightsFunction(1100),
      PROJECTS:  this.rightsFunction(1200),
      TEXTS:     this.rightsFunction(1300),
      QUESTIONS: this.rightsFunction(1400),
      ANSWERS:   this.rightsFunction(1500),
      COMMENTS:  this.rightsFunction(1600),
      TEMPLATES: this.rightsFunction(1700),
      TAGS:      this.rightsFunction(1800),
      ENTRIES:   this.rightsFunction(1900)
    };
    const operations: Operations = {
      CREATE:       this.rightsFunction(1),
      EDIT:         this.rightsFunction(2),
      DELETE:       this.rightsFunction(3),
      LOCK:         this.rightsFunction(4),
      VIEW:         this.rightsFunction(5),
      VIEW_OWN:     this.rightsFunction(6),
      EDIT_OWN:     this.rightsFunction(7),
      DELETE_OWN:   this.rightsFunction(8),
      ARCHIVE:      this.rightsFunction(9)
    };

    this.domain = domains;
    this.operation = operations;

    // session instance (singleton) that references the data
    this.session = new Session();
  }

  projectId() {
    return this.api.projectId;
  }

  getSession(forceRefresh: boolean = false, callback?: SessionCallback): angular.IPromise<Session> {
    if (this.session.data && !forceRefresh) {
      if (callback) callback(this.session);
      return this.$q.when(this.session); // Wrap session in a promise
    }

    return this.fetchSessionData(forceRefresh).then((data: SessionData) => {
      this.session.data = data;
      this.exceptionHandler.updateInformation({
        version: data.version,
        userId: data.userId,
        userName: data.username,
        projectCode: data.project != null ? data.project.projectCode : null,
        projectName: data.project != null ? data.project.projectName : null
      });
      if (callback) callback(this.session);
      return this.session;
    });
  }

  getCaptchaData(callback?: JsonRpcCallback): angular.IPromise<any> {
    return this.api.call('get_captcha_data', [], callback);
  }

  private fetchSessionData(forceRefresh: boolean): angular.IPromise<SessionData> {
    if (this.sessionDataPromise && !forceRefresh) return this.sessionDataPromise;

    const promise: angular.IPromise<SessionData> = this.api.call('session_getSessionData').then(result => {
      return result.data;
    }).catch(result => {
      console.error(result); // TODO decide whether to show to user or just retry
      return this.fetchSessionData(forceRefresh); // retry
    });

    if (!this.sessionDataPromise) this.sessionDataPromise = promise;
    return promise;
  }

  private rightsFunction(val: number): RightsFunction {
    return () => val;
  }
}
