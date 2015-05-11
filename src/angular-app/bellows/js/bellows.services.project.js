'use strict';

angular.module('bellows.services')
  .service('projectService', ['jsonRpc', 'sessionService', function(jsonRpc, ss) {
    jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
    this.create = function(projectName, projectCode, appName, callback) {
      jsonRpc.call('project_create', [projectName, projectCode, appName], callback);
    };
    this.createSwitchSession = function(projectName, projectCode, appName, callback) {
      jsonRpc.call('project_create_switchSession', [projectName, projectCode, appName], callback);
    };
    this.archiveAsAdmin = function(callback) {
      jsonRpc.call('project_archive_asAdmin', [], callback);
    };
    this.archivedList = function(callback) {
      jsonRpc.call('project_archivedList', [], callback);
    };
    this.publish = function(projectIds, callback) {
      jsonRpc.call('project_publish', [projectIds], callback);
    };
    this.list = function(callback) {
      jsonRpc.call('project_list_dto', [], callback);
    };
    this.users = function(callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };
    this.readUser = function(userId, callback) {
      jsonRpc.call('project_readUser', [userId], callback);
    };
    this.updateUserRole = function(userId, role, callback) {
      jsonRpc.call('project_updateUserRole', [userId, role], callback);
    };
    this.acceptJoinRequest = function(userId, role, callback) {
      jsonRpc.call('project_acceptJoinRequest', [userId, role], callback);
    }
    this.denyJoinRequest = function(userId, callback) {
      jsonRpc.call('project_denyJoinRequest', [userId], callback);
    }   
    this.getOwner = function(projectId, callback) {
      jsonRpc.call('project_getOwner', [projectId], callback);
    };
    this.removeUsers = function(users, callback) {
      jsonRpc.call('project_removeUsers', [users], callback);
    };
    this.projectCodeExists = function(projectCode, callback) {
      jsonRpc.call('projectcode_exists', [projectCode], callback);
    };
    this.joinProject = function(projectId, role, callback) {
      jsonRpc.call('project_joinProject', [projectId, role], callback);
    };
    this.listUsers = function users(callback) {
      jsonRpc.call('project_usersDto', [], callback);
    };
    this.sendJoinRequest = function user_sendJoinRequest(projectId, callback) {
      jsonRpc.call('project_sendJoinRequest', [projectId], callback);
    }
    this.getJoinRequests = function getJoinRequests(callback) {
      jsonRpc.call('project_getJoinRequests', [], callback);
    };
    
    



    // data constants
    this.data = {};
    this.data.projectTypeNames = {
      'sfchecks': 'Community Scripture Checking',
      'webtypesetting': 'Typesetting',
      'semdomtrans': 'Semantic Domain Translation',
      'lexicon': 'Dictionary'
    };
    this.data.projectTypesBySite = function() {
      var types = {
        'scriptureforge': ['sfchecks'],
        'languageforge': ['lexicon', 'semdomtrans']
      };
      return types[ss.baseSite()];
    };

  }]);
