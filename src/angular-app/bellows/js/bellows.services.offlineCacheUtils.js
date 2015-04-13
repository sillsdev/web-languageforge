'use strict';

angular.module('bellows.services')
  .factory('offlineCacheUtils', ['$window', '$q', 'sessionService', 'offlineCache', function($window, $q, sessionService, offlineCache) {
    var projectId = sessionService.session.project.id;

    var updateProjectData = function updateProject(timestamp, commentsUserPlusOne, isComplete) {
      var obj = {
        id: projectId,
        commentsUserPlusOne: commentsUserPlusOne,
        timestamp: timestamp,
        isComplete: isComplete
      };
      return offlineCache.setObjectsInStore('projects', projectId, [obj]);
    };

    var getProjectData = function getProjectData() {
      return offlineCache.getOneFromStore('projects', projectId);
    };

    return {
      getProjectData: getProjectData,
      updateProjectData: updateProjectData,
      canCache: offlineCache.canCache
    };
  }]);

