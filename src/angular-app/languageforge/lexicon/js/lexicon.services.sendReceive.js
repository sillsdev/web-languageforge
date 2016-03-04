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

    this.receiveProject = function receiveProject(callback) {
      jsonRpc.call('sendReceive_receiveProject', [], callback);
    };

    this.commitProject = function commitProject(callback) {
      jsonRpc.call('sendReceive_commitProject', [], callback);
    };

    this.getProjectStatus = function getProjectStatus(callback) {
      jsonRpc.call('sendReceive_getProjectStatus', [], callback);
    };
  }])

  ;
