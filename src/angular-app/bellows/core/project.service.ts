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

    this.create = this.api.method('project_create');
    this.createSwitchSession = this.api.method('project_create_switchSession');
    this.joinSwitchSession = this.api.method('project_join_switchSession');
    this.archivedList = this.api.method('project_archivedList');
    this.remove = this.api.method('project_delete');
    this.publish = this.api.method('project_publish');
    this.users = this.api.method('project_usersDto');
    this.readUser = this.api.method('project_readUser');
    this.updateUserRole = this.api.method('project_updateUserRole');
    this.acceptJoinRequest = this.api.method('project_acceptJoinRequest');
    this.denyJoinRequest = this.api.method('project_denyJoinRequest');
    this.getOwner = this.api.method('project_getOwner');
    this.removeUsers = this.api.method('project_removeUsers');
    this.projectCodeExists = this.api.method('projectcode_exists');
    this.joinProject = this.api.method('project_joinProject');
    this.listUsers = this.api.method('project_usersDto');
    this.sendJoinRequest = this.api.method('project_sendJoinRequest');
    this.getJoinRequests = this.api.method('project_getJoinRequests');
    this.getDto = this.api.method('project_management_dto');
    this.archiveProject = this.api.method('project_archive');
    this.deleteProject = this.api.method('project_delete');

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
