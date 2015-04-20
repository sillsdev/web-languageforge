'use strict';

angular.module('bellows.services')
  .service('activityPageService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.list_activity = function(offset, count, callback) {
      jsonRpc.call('activity_list_dto', [offset, count], callback);
    };
  }]);
