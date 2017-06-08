'use strict';

angular.module('bellows.services')
  .service('projectService', ['apiService', 'sessionService', 'offlineCache', '$q', function (api, ss, offlineCache, $q) {

    this.create = api.method('project_create');
    this.createSwitchSession = api.method('project_create_switchSession');
    this.joinSwitchSession = api.method('project_join_switchSession');
    this.archivedList = api.method('project_archivedList');
    this.remove = api.method('project_delete');
    this.publish = api.method('project_publish');

    this.list = function () {
      if (navigator.onLine /* TODO use Offline.state */) {
        var deferred = $q.defer();

        api.call('project_list_dto', [], function (response) {
          if (response.ok) deferred.resolve(response.data.entries);
          else deferred.reject();
        });

        return deferred.promise;
      } else return offlineCache.getAllFromStore('projects');
    };

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
    this.getDto = api.method('project_management_dto'); // TODO this is just for names of reports right? If so rename

    this.runReport = function runReport(reportName, params, callback) {
      params = params || [];
      api.call('project_management_report_' + reportName, params, callback);
    };

    this.archiveProject = api.method('project_archive')
    this.deleteProject = api.method('project_delete')

    // data constants
    this.data = {};
    this.data.projectTypeNames = {
      sfchecks: 'Community Scripture Checking',
      webtypesetting: 'Typesetting',
      semdomtrans: 'Semantic Domain Translation',
      lexicon: 'Dictionary'
    };
    this.data.projectTypesBySite = function () {
      var types = {
        scriptureforge: ['sfchecks'],

        //languageforge: ['lexicon', 'semdomtrans']
        languageforge: ['lexicon']
      };
      return types[ss.baseSite()];
    };

  }]);
