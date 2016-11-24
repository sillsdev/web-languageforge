'use strict';

angular.module('bellows.services.comments')
  .factory('commentsOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache',
    'offlineCacheUtils',
  function ($window, $q, sessionService, offlineCache, offlineCacheUtils) {
    var projectId = sessionService.session.project.id;

    function getAllComments() {
      return offlineCache.getAllFromStore('comments', projectId);
    }

    function deleteComment(id) {
      return offlineCache.deleteObjectInStore('comments', id);
    }

    function updateComments(comments) {
      return offlineCache.setObjectsInStore('comments', projectId, comments);
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

