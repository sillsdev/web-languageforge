'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['jsonRpc', 'sessionService', function(jsonRpc, sessionService) {

    var project = sessionService.session.project;

    jsonRpc.connect({
      url: '/api/sf',
      projectId: project ? project.id : undefined
    });
    this.list_activity = function(offset, count, callback) {
      jsonRpc.call('activity_list_dto', [offset, count], callback);
    };
  }]);
