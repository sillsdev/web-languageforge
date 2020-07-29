import * as angular from 'angular';

import {Project} from '../../shared/model/project.model';
import {OfflineCacheService} from '../offline/offline-cache.service';
import {Session, SessionService} from '../session.service';
import {ApiService, JsonRpcCallback} from './api.service';

export interface ProjectTypeNames {
  [projectType: string]: string;
}

export interface ProjectData {
  projectTypeNames: ProjectTypeNames;
  projectTypesBySite: () => string[];
}

export interface ProjectList {
  count: number;
  entries: Project[];
}

export class ProjectService {
  data: ProjectData;

  protected api: ApiService;
  protected sessionService: SessionService;
  private offlineCache: OfflineCacheService;
  private $location: angular.ILocationService;
  private $q: angular.IQService;

  // noinspection TypeScriptFieldCanBeMadeReadonly
  private projectTypesBySite: string[] = [];

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService) {
    this.api = $injector.get('apiService');
    this.sessionService = $injector.get('sessionService');
    this.offlineCache = $injector.get('offlineCache');
    this.$location = $injector.get('$location');
    this.$q = $injector.get('$q');

    // data constants
    this.data = {
      projectTypeNames: {
        sfchecks: 'Community Scripture Checking',
        webtypesetting: 'Typesetting',
        semdomtrans: 'Semantic Domain Translation',
        lexicon: 'Dictionary'
      },
      projectTypesBySite: () => {
        return this.projectTypesBySite;
      }
    } as ProjectData;

    this.sessionService.getSession().then((session: Session) => {
      const types = {
        // 'languageforge': ['lexicon', 'semdomtrans'],
        languageforge: ['lexicon'],
        scriptureforge: ['sfchecks']
      };

      this.projectTypesBySite = types[session.baseSite()];
    });

  }

  create(projectName: string, projectCode: string, appName: string, srProject: any = {},
         callback?: JsonRpcCallback<any>) {
    return this.api.call('project_create', [projectName, projectCode, appName, srProject], callback);
  }

  createSwitchSession(projectName: string, projectCode: string, appName: string, srProject: any = {},
                      callback?: JsonRpcCallback<any>) {
    return this.api.call('project_create_switchSession', [projectName, projectCode, appName, srProject], callback);
  }

  joinSwitchSession(srProject: any, role: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_join_switchSession', [srProject, role], callback);
  }

  archiveProject(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_archive', [], callback);
  }

  archivedList(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_archivedList', [], callback);
  }

  publish(projectIds: string[], callback?: JsonRpcCallback<any>) {
    return this.api.call('project_publish', [projectIds], callback);
  }

  list() {
    if (navigator.onLine /* TODO use Offline.state */) {
      const deferred = this.$q.defer<Project[]>();

      this.api.call<ProjectList>('project_list_dto', [], response => {
        if (response.ok) deferred.resolve(response.data.entries);
        else deferred.reject();
      });

      return deferred.promise;
    } else {
      return this.offlineCache.getAllFromStore('projects') as angular.IPromise<Project[]>;
    }
  }

  joinProject(projectId: string, role: string, callback?: JsonRpcCallback<string>) {
    return this.api.call('project_joinProject', [projectId, role], callback);
  }

  listUsers(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_usersDto', [], callback);
  }

  getJoinRequests(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_getJoinRequests', [], callback);
  }

  sendJoinRequest(projectId: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_sendJoinRequest', [projectId], callback);
  }

  deleteProject(projectIds: string[], callback?: JsonRpcCallback<any>) {
    return this.api.call('project_delete', [projectIds], callback);
  }

  projectCodeExists(projectCode: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('projectcode_exists', [projectCode], callback);
  }

  updateUserRole(userId: string, role: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_updateUserRole', [userId, role], callback);
  }

  acceptJoinRequest(userId: string, role: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_acceptJoinRequest', [userId, role], callback);
  }

  denyJoinRequest(userId: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_denyJoinRequest', [userId], callback);
  }

  removeUsers(userIds: string[], callback?: JsonRpcCallback<any>) {
    return this.api.call('project_removeUsers', [userIds], callback);
  }

  getDto(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_management_dto', [], callback);
  }

  runReport(reportName: string, params: any[] = [], callback?: JsonRpcCallback<any>) {
    return this.api.call('project_management_report_' + reportName, params, callback);
  }

  getInviteLink(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_getInviteLink', [], callback);
  }

  createInviteLink(defaultRole: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_createInviteLink', [defaultRole], callback);
  }

  updateInviteTokenRole(newRole: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('project_updateInviteTokenRole', [newRole], callback);
  }

  disableInviteToken(callback?: JsonRpcCallback<any>) {
    return this.api.call('project_disableInviteToken', [], callback);
  }

  csvInsights() {
    return this.api.call<string>('project_insights_csv');
  }

}
