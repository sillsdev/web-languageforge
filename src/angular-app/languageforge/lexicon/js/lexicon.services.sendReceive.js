'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.getUserProjects = function getUserProjects(username, password, callback) {
      jsonRpc.call('sr_get_userProjects', [username, password], callback);
    };

    this.checkProject = function checkProject(identifier, username, password, callback) {
      jsonRpc.call('sr_check_project', [identifier, username, password], callback);
    };

    this.saveCredentials = function saveCredentials(identifier, username, password, callback) {
      jsonRpc.call('sr_save_credentials', [identifier, username, password], callback);
    };
  }])

  ;
