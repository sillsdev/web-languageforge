'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.getUserProjects = function getUserProjects(username, password, callback) {
      jsonRpc.call('sendReceive_getUserProjects', [username, password], callback);
    };

    this.saveCredentials = function saveCredentials(srProject, username, password, callback) {
      jsonRpc.call('sendReceive_saveCredentials', [srProject, username, password], callback);
    };

    this.mergeProject = function mergeProject(callback) {
      jsonRpc.call('sendReceive_mergeProject', [], callback);
    };

    this.getProjectStatus = function getProjectStatus(callback) {
      jsonRpc.call('sendReceive_getProjectStatus', [], callback);
    };
  }])

  ;
