'use strict';

angular.module('lexicon.services')
/**
 * implements an offline cache storage system
 *
 *
 */
  .factory('lexiconOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache', function($window, $q, sessionService, offlineCache) {
    var projectId = sessionService.session.project.id;

    var getAllEntries = function getAllEntries() {
      return offlineCache.getAllFromStore('entries', projectId);
    };

    var getAllComments = function getAllComments() {
      return offlineCache.getAllFromStore('comments', projectId);
    };

    var deleteEntry = function deleteEntry(id) {
      return offlineCache.deleteObjectInStore('entries', id);
    };
    var deleteComment = function deleteComment(id) {
      return offlineCache.deleteObjectInStore('comments', id);
    };

    /**
     *
     * @param entries - array
     * @returns {promise}
     */
    var updateEntries = function updateEntries(entries) {
      return offlineCache.setObjectsInStore('entries', projectId, entries);
    };

    var updateComments = function updateComments(comments) {
      return offlineCache.setObjectsInStore('comments', projectId, comments);
    };

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
      getAllEntries: getAllEntries,
      getAllComments: getAllComments,
      getProjectData: getProjectData,
      updateEntries: updateEntries,
      updateComments: updateComments,
      updateProjectData: updateProjectData,
      deleteEntry: deleteEntry,
      deleteComment: deleteComment,
      canCache: offlineCache.canCache
    };
  }]);

