import * as angular from 'angular';

import { OfflineCacheService } from '../offline/offline-cache.service';
import { SessionService } from '../session.service';
import { ApiService, JsonRpcCallback } from './api.service';

export class ProjectService {

  protected api: ApiService;
  protected sessionService: SessionService;
  private offlineCache: OfflineCacheService;
  private $q: angular.IQService;

  // noinspection TypeScriptFieldCanBeMadeReadonly

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService) {
    this.api = $injector.get('apiService');
    this.sessionService = $injector.get('sessionService');
    this.offlineCache = $injector.get('offlineCache');
    this.$q = $injector.get('$q');
  }

  createSwitchSession(projectName: string, projectCode: string, appName: string, srProject: any = {},
    callback?: JsonRpcCallback) {
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
    if (navigator.onLine) {
      const deferred = this.$q.defer();

      this.api.call('project_list_dto', [], response => {
        if (response.ok) deferred.resolve(response.data.entries);
        else deferred.reject();
      });

      return deferred.promise;
    } else {
      return this.offlineCache.getAllFromStore('projects');
    }
  }

  joinProject(projectId: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_joinProject', [projectId, role], callback);
  }

  listUsers(callback?: JsonRpcCallback) {
    return this.api.call('project_usersDto', [], callback);
  }

  deleteProject(projectIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_delete', [projectIds], callback);
  }

  projectCodeExists(projectCode: string, callback?: JsonRpcCallback) {
    return this.api.call('projectcode_exists', [projectCode], callback);
  }

  updateUserRole(userId: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('project_updateUserRole', [userId, role], callback);
  }

  transferOwnership(newOwnerId: string, callback?: JsonRpcCallback) {
    return this.api.call('project_transferOwnership', [newOwnerId], callback);
  }

  removeUsers(userIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('project_removeUsers', [userIds], callback);
  }

  removeSelfFromProject(aProjectId: string, callback?: JsonRpcCallback) {
    return this.api.call('project_removeSelf', [aProjectId], callback);
  }

  getInviteLink(callback?: JsonRpcCallback) {
    return this.api.call('project_getInviteLink', [], callback);
  }

  createInviteLink(defaultRole: string, callback?: JsonRpcCallback) {
    return this.api.call('project_createInviteLink', [defaultRole], callback);
  }

  updateInviteTokenRole(newRole: string, callback?: JsonRpcCallback) {
    return this.api.call('project_updateInviteTokenRole', [newRole], callback);
  }

  disableInviteToken(callback?: JsonRpcCallback) {
    return this.api.call('project_disableInviteToken', [], callback);
  }

  csvInsights() {
    return this.api.call('project_insights_csv');
  }

  getLdapiProjectDto(projectCode: string, callback?: JsonRpcCallback) {
    return this.api.call('ldapi_get_project', [projectCode], callback);
  }

  getAllLdapiProjects(callback?: JsonRpcCallback) {
    return this.api.call('ldapi_get_all_projects', [], callback);
  }

  updateLdapiUserRole(projectCode: string, username: string, role: string, callback?: JsonRpcCallback) {
    return this.api.call('ldapi_project_updateUserRole', [projectCode, username, role], callback);
  }

  removeUserFromLdapiProject(projectCode: string, username: string, callback?: JsonRpcCallback) {
    return this.api.call('ldapi_project_removeUser', [projectCode, username], callback);
  }
}
