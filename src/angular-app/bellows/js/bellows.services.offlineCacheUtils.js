'use strict';

angular.module('bellows.services')
  .factory('offlineCacheUtils', ['$window', '$q', 'sessionService', 'offlineCache',
  function ($window, $q, sessionService, offlineCache) {

    function updateProjectData(timestamp, commentsUserPlusOne, isComplete) {
      var obj = {
        id: sessionService.getProjectId(),
        commentsUserPlusOne: commentsUserPlusOne,
        timestamp: timestamp,
        isComplete: isComplete
      };
      return offlineCache.setObjectsInStore('projects', sessionService.getProjectId(), [obj]);
    }

    function getProjectData() {
      return offlineCache.getOneFromStore('projects', sessionService.getProjectId());
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

