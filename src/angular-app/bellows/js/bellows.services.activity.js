'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['apiService', 'sessionService', function(api, sessionService) {

    var project = sessionService.session.project;

    this.list_activity = api.method('activity_list_dto');
  }]);
