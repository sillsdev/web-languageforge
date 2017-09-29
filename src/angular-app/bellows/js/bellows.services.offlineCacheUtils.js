'use strict';

angular.module('bellows.services')
  .factory('offlineCacheUtils', ['$window', '$q', 'sessionService', 'offlineCache',
  function ($window, $q, sessionService, offlineCache) {

    function updateProjectData(timestamp, commentsUserPlusOne, isComplete) {
      var obj = {
        id: sessionService.projectId(),
        commentsUserPlusOne: commentsUserPlusOne,
        timestamp: timestamp,
        isComplete: isComplete
      };
      return offlineCache.setObjectsInStore('projects', sessionService.projectId(), [obj]);
    }

    function getProjectData() {
      return offlineCache.getOneFromStore('projects', sessionService.projectId());
    }

    function getProjects() {
      return offlineCache.getAllFromStore('projects');
    }

    return {
      getProjectData: getProjectData,
      updateProjectData: updateProjectData,
      canCache: offlineCache.canCache
    };
  }]);

