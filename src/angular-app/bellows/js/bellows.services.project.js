'use strict';

angular.module('bellows.services')
  .service('projectService', ['jsonRpc', 'sessionService', 'offlineCache', '$q', function (jsonRpc, ss, offlineCache, $q) {
    // Note this doesn't actually 'connect', it simply sets the connection url.

    var project = ss.session.project;
    jsonRpc.connect({
      url: '/api/sf',
      projectId: project ? project.id : undefined
    });


    this.create = function (projectName, projectCode, appName, callback) {
      jsonRpc.call('project_create', [projectName, projectCode, appName], callback);
    };

    this.createSwitchSession = function (projectName, projectCode, appName, srProject, callback) {
      jsonRpc.call('project_create_switchSession',
        [projectName, projectCode, appName, srProject], callback);
    };

    this.joinSwitchSession = function (srIdentifier, role, callback) {
      jsonRpc.call('project_join_switchSession', [srIdentifier, role], callback);
    };

    this.archivedList = function (callback) {
      jsonRpc.call('project_archivedList', [], callback);
    };

    this.remove = function (projectIds, callback) {
      jsonRpc.call('project_delete', [projectIds], callback);
    };

    this.publish = function (projectIds, callback) {
      jsonRpc.call('project_publish', [projectIds], callback);
    };

    this.list = function () {
      if (navigator.onLine /* TODO use Offline.state */) {
        var deferred = $q.defer();

        jsonRpc.call('project_list_dto', [], function (response) {
          if (response.ok) deferred.resolve(response.data.entries);
          else deferred.reject();
        });

        return deferred.promise;
      } else return offlineCache.getAllFromStore('projects');
    };

    this.users = function (callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };

    this.readUser = function (userId, callback) {
      jsonRpc.call('project_readUser', [userId], callback);
    };

    this.updateUserRole = function (userId, role, callback) {
      jsonRpc.call('project_updateUserRole', [userId, role], callback);
    };

    this.acceptJoinRequest = function (userId, role, callback) {
      jsonRpc.call('project_acceptJoinRequest', [userId, role], callback);
    };

    this.denyJoinRequest = function (userId, callback) {
      jsonRpc.call('project_denyJoinRequest', [userId], callback);
    };

    this.getOwner = function (projectId, callback) {
      jsonRpc.call('project_getOwner', [projectId], callback);
    };

    this.removeUsers = function (users, callback) {
      jsonRpc.call('project_removeUsers', [users], callback);
    };

    this.projectCodeExists = function (projectCode, callback) {
      jsonRpc.call('projectcode_exists', [projectCode], callback);
    };

    this.joinProject = function (projectId, role, callback) {
      jsonRpc.call('project_joinProject', [projectId, role], callback);
    };

    this.listUsers = function users(callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };

    this.sendJoinRequest = function userSendJoinRequest(projectId, callback) {
      jsonRpc.call('project_sendJoinRequest', [projectId], callback);
    };

    this.getJoinRequests = function getJoinRequests(callback) {
      jsonRpc.call('project_getJoinRequests', [], callback);
    };

    this.getDto = function getDto(callback) {
      jsonRpc.call('project_management_dto', [], callback);
    };

    this.runReport = function runReport(reportName, params, callback) {
      params = params || [];
      jsonRpc.call('project_management_report_' + reportName, params, callback);
    };

    this.archiveProject = function archiveProject(callback) {
      jsonRpc.call('project_archive', [], callback);
    };

    this.deleteProject = function deleteProject(callback) {
      jsonRpc.call('project_delete', [], callback);
    };

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
