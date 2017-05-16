'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['jsonRpc', 'sessionService', function(jsonRpc, sessionService) {
    jsonRpc.connect({
      url: '/api/sf',
      projectId: sessionService.session.project.id
    });
    this.list_activity = function(offset, count, callback) {
      jsonRpc.call('activity_list_dto', [offset, count], callback);
    };
  }]);
