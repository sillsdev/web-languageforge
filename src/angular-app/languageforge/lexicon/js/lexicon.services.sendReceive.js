'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.checkProject = function checkProject(projectCode, username, password, callback) {
      jsonRpc.call('sr_check_project', [projectCode, username, password], callback);
    };
  }])

  ;
