import * as angular from 'angular';

import { ApiMethod, ApiService } from  './api.service';
import { JsonRpcCallback } from './json-rpc.service';
import { Session, SessionService } from './session.service';

export class ProjectData {
  projectTypeNames: any;
  projectTypesBySite: () => string[];
}

export class ProjectService {
  create: ApiMethod;
  createSwitchSession: ApiMethod;
  joinSwitchSession: ApiMethod;
  archivedList: ApiMethod;
  remove: ApiMethod;
  publish: ApiMethod;
  users: ApiMethod;
  readUser: ApiMethod;
  updateUserRole: ApiMethod;
  acceptJoinRequest: ApiMethod;
  denyJoinRequest: ApiMethod;
  getOwner: ApiMethod;
  removeUsers: ApiMethod;
  projectCodeExists: ApiMethod;
  joinProject: ApiMethod;
  listUsers: ApiMethod;
  sendJoinRequest: ApiMethod;
  getJoinRequests: ApiMethod;
  getDto: ApiMethod;
  archiveProject: ApiMethod;
  deleteProject: ApiMethod;
  data: ProjectData;

  private projectTypesBySite: string[];

  static $inject: string[] = ['apiService', 'sessionService', 'offlineCache', '$q'];
  constructor(private api: ApiService, private sessionService: SessionService, private offlineCache: any, private $q: angular.IQService)
  {
    this.create = api.method('project_create');
    this.createSwitchSession = api.method('project_create_switchSession');
    this.joinSwitchSession = api.method('project_join_switchSession');
    this.archivedList = api.method('project_archivedList');
    this.remove = api.method('project_delete');
    this.publish = api.method('project_publish');
    this.users = api.method('project_usersDto');
    this.readUser = api.method('project_readUser');
    this.updateUserRole = api.method('project_updateUserRole');
    this.acceptJoinRequest = api.method('project_acceptJoinRequest');
    this.denyJoinRequest = api.method('project_denyJoinRequest');
    this.getOwner = api.method('project_getOwner');
    this.removeUsers = api.method('project_removeUsers');
    this.projectCodeExists = api.method('projectcode_exists');
    this.joinProject = api.method('project_joinProject');
    this.listUsers = api.method('project_usersDto');
    this.sendJoinRequest = api.method('project_sendJoinRequest');
    this.getJoinRequests = api.method('project_getJoinRequests');
    this.getDto = api.method('project_management_dto');
    this.archiveProject = api.method('project_archive');
    this.deleteProject = api.method('project_delete');

    // data constants
    this.data = new ProjectData();
    this.data.projectTypeNames = {
      sfchecks: 'Community Scripture Checking',
      webtypesetting: 'Typesetting',
      semdomtrans: 'Semantic Domain Translation',
      lexicon: 'Dictionary',
      translate: 'Translation'
    };

    sessionService.getSession().then((session: Session) => {
      let types = {
        scriptureforge: ['sfchecks'],

        //languageforge: ['lexicon', 'semdomtrans']
        languageforge: ['translate']
      };
      this.projectTypesBySite = types[session.baseSite()];
    });

    this.data.projectTypesBySite = () => {
      return this.projectTypesBySite;
    };

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

  runReport(reportName: string, params: any[] = [], callback: JsonRpcCallback) {
    this.api.call('project_management_report_' + reportName, params, callback);
  };

}
