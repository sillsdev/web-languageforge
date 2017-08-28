import * as angular from 'angular';

import { ApiService, JsonRpcCallback } from './api/api.service';

export class Session {
  readonly userId: SessionDataFunction;
  readonly fileSizeMax: SessionDataFunction;
  readonly baseSite: SessionDataFunction;
  readonly projectSettings: SessionDataFunction;
  readonly project: SessionDataFunction;
  readonly username: SessionDataFunction;

  constructor(public data?: SessionData) {
    this.userId = this.sessionDataFunctionFor('userId');
    this.fileSizeMax = this.sessionDataFunctionFor('fileSizeMax');
    this.baseSite = this.sessionDataFunctionFor('baseSite');
    this.projectSettings = this.sessionDataFunctionFor('projectSettings');
    this.project = this.sessionDataFunctionFor('project');
    this.username = this.sessionDataFunctionFor('username');
  }

  hasSiteRight(domain: RightsFunction, operation: RightsFunction): boolean {
    return this.hasRight(this.data.userSiteRights, domain, operation);
  };

  hasProjectRight(domain: RightsFunction, operation: RightsFunction): boolean {
    return this.hasRight(this.data.userProjectRights, domain, operation);
  };

  hasRight(rights: any, domain: RightsFunction, operation: RightsFunction): boolean {
    if (!rights) return false;
    let right = domain() + operation();
    return rights.indexOf(right) !== -1;
  };

  getProjectSetting(setting: string) {
    return this.data.projectSettings[setting];
  };

  private sessionDataFunctionFor(key: string): SessionDataFunction {
    return (): any => {
      return this.data[key];
    };
  }

}

export interface SessionCallback { (session: Session): void; }

interface SessionDataFunction { (): any}

class SessionData {
  userId: string;
  fileSizeMax: number;
  baseSite: string;
  projectSettings: any;
  project: any;
  username: string;
  userSiteRights: any;
  userProjectRights: any;
}

export interface RightsFunction { (): number }

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

  static $inject: string[] = ['apiService', '$q'];
  constructor(private api: ApiService, private $q: angular.IQService) {
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
  };

  getSession(forceRefresh: boolean = false, callback?: SessionCallback): angular.IPromise<Session> {
    if (this.session.data && !forceRefresh) {
      if (callback) callback(this.session);
      return this.$q.when(this.session); // Wrap session in a promise
    }

    return this.fetchSessionData(forceRefresh).then((data: SessionData) => {
      this.session.data = data;
      if (callback) callback(this.session);
      return this.session;
    });
  };

  getCaptchaData(callback?: JsonRpcCallback): angular.IPromise<any> {
    return this.api.call('get_captcha_data', [], callback);
  }

  private fetchSessionData(forceRefresh: boolean): angular.IPromise<SessionData> {
    if (this.sessionDataPromise && !forceRefresh) return this.sessionDataPromise;

    let promise: angular.IPromise<SessionData> = this.api.call('session_getSessionData').then((response) => {
      return response.data;
    }).catch((response) => {
      console.error(response); // TODO decide whether to show to user or just retry
      return this.fetchSessionData(forceRefresh); // retry
    });

    if (!this.sessionDataPromise) this.sessionDataPromise = promise;
    return promise;
  }

  private rightsFunction(val: number): RightsFunction {
    return function () {
      return val;
    };
  }

}

