'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['apiService', 'sessionService', function(api, sessionService) {
    this.list_activity = api.method('activity_list_dto');
  }]);
