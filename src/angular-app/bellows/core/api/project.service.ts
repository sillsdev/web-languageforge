import * as angular from 'angular';

import { ApiService, JsonRpcCallback } from './api.service';
import { Session, SessionService } from '../session.service';

export class ProjectData {
  projectTypeNames: any;
  projectTypesBySite: () => string[];
}

export class ProjectService {
  data: ProjectData;

  protected api: ApiService;
  protected sessionService: SessionService;
  private offlineCache: any;
  private $q: angular.IQService;

  private projectTypesBySite: string[];

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService)
  {
    this.api = $injector.get('apiService');
    this.sessionService = $injector.get('sessionService');
    this.offlineCache = $injector.get('offlineCache');
    this.$q = $injector.get('$q');

    // data constants
    this.data = new ProjectData();
    this.data.projectTypeNames = {
      sfchecks: 'Community Scripture Checking',
      webtypesetting: 'Typesetting',
      semdomtrans: 'Semantic Domain Translation',
      lexicon: 'Dictionary'
    };

    this.sessionService.getSession().then((session: Session) => {
      let types = {
        scriptureforge: ['sfchecks'],

        //languageforge: ['lexicon', 'semdomtrans']
        languageforge: ['lexicon']
      };
      this.projectTypesBySite = types[session.baseSite()];
    });

    this.data.projectTypesBySite = () => {
      return this.projectTypesBySite;
    };

  }

  create(projectName: string, projectCode: string, appName: string, srProject: any = {}, callback?: JsonRpcCallback) {
    return this.api.call('project_create', [projectName, projectCode, appName, srProject], callback);
  }

  createSwitchSession(projectName: string, projectCode: string, appName: string, srProject: any = {}, callback?: JsonRpcCallback) {
    return this.api.call('project_create_switchSession', [projectName, projectCode, appName, srProject], callback);
  }

  joinSwitchSession(srProject: any, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_join_switchSession', [srProject, role], callback);
  }

  archiveProject(callback?: JsonRpcCallback) {
    return this.api.call('project_archive', [], callback);
  }

  archivedList(callback?: JsonRpcCallback) {
    return this.api.call('project_archivedList', [], callback);
  }

  publish(projectIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_publish', [projectIds], callback);
  }

  list() {
    if (navigator.onLine /* TODO use Offline.state */) {
      let deferred = this.$q.defer();

      this.api.call('project_list_dto', [], (response) => {
        if (response.ok) deferred.resolve(response.data.entries);
        else deferred.reject();
      });

      return deferred.promise;
    } else {
      return this.offlineCache.getAllFromStore('projects');
    }
  };

  joinProject(projectId: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_joinProject', [projectId, role], callback);
  }

  listUsers(callback?: JsonRpcCallback) {
    return this.api.call('project_usersDto', [], callback);
  }

  /**
   * @deprecated use listUsers instead
   * @param {JsonRpcCallback} callback
   * @returns {angular.IPromise<any>}
   */
  users(callback?: JsonRpcCallback) {
    return this.api.call('project_usersDto', [], callback);
  }

  getJoinRequests(callback?: JsonRpcCallback) {
    return this.api.call('project_getJoinRequests', [], callback);
  }

  sendJoinRequest(projectId: string, callback?: JsonRpcCallback) {
    return this.api.call('project_sendJoinRequest', [projectId], callback);
  }

  deleteProject(projectIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_delete', [projectIds], callback);
  }

  /**
   * @deprecated use deleteProject instead
   * @param {string[]} projectIds
   * @param {JsonRpcCallback} callback
   * @returns {angular.IPromise<any>}
   */
  remove(projectIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_delete', [projectIds], callback);
  }

  projectCodeExists(projectCode: string, callback?: JsonRpcCallback) {
    return this.api.call('projectcode_exists', [projectCode], callback);
  }

  updateUserRole(userId: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_updateUserRole', [userId, role], callback);
  }

  acceptJoinRequest(userId: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_acceptJoinRequest', [userId, role], callback);
  }

  denyJoinRequest(userId: string, callback?: JsonRpcCallback) {
    return this.api.call('project_denyJoinRequest', [userId], callback);
  }

  removeUsers(userIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_removeUsers', [userIds], callback);
  }


  getDto(callback?: JsonRpcCallback) {
    return this.api.call('project_management_dto', [], callback);
  }

  runReport(reportName: string, params: any[] = [], callback?: JsonRpcCallback) {
    this.api.call('project_management_report_' + reportName, params, callback);
  };

}
