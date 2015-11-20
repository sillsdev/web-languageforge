'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.checkProject = function checkProject(identifier, username, password, callback) {
      jsonRpc.call('sr_check_project', [identifier, username, password], callback);
    };

    this.saveCredentials = function saveCredentials(identifier, username, password, callback) {
      jsonRpc.call('sr_save_credentials', [identifier, username, password], callback);
    };
  }])

  ;
