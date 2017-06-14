'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['apiService', function(api) {
    this.list_activity = api.method('activity_list_dto');
  }]);
