'use strict';

angular.module('bellows.services.comments')
  .factory('commentsOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache',
    'offlineCacheUtils',
  function ($window, $q, sessionService, offlineCache, offlineCacheUtils) {

    function getAllComments() {
      return offlineCache.getAllFromStore('comments', sessionService.projectId());
    }

    function deleteComment(id) {
      return offlineCache.deleteObjectInStore('comments', id);
    }

    function updateComments(comments) {
      return offlineCache.setObjectsInStore('comments', sessionService.projectId(), comments);
    }

    return {
      getAllComments: getAllComments,
      getProjectData: offlineCacheUtils.getProjectData,
      updateComments: updateComments,
      updateProjectData: offlineCacheUtils.updateProjectData,
      deleteComment: deleteComment,
      canCache: offlineCache.canCache
    };
  }]);

