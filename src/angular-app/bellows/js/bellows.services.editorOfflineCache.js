'use strict';

angular.module('bellows.services')
/**
 * implements an offline cache storage system
 *
 *
 */
  .factory('editorOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache', 'offlineCacheUtils', function($window, $q, sessionService, offlineCache, offlineCacheUtils) {
    var projectId = sessionService.session.project.id;

    var getAllEntries = function getAllEntries() {
      return offlineCache.getAllFromStore('entries', projectId);
    };

    var deleteEntry = function deleteEntry(id) {
      return offlineCache.deleteObjectInStore('entries', id);
    };

    /**
     *
     * @param entries - array
     * @returns {promise}
     */
    var updateEntries = function updateEntries(entries) {
      return offlineCache.setObjectsInStore('entries', projectId, entries);
    };

    return {
      getAllEntries: getAllEntries,
      getProjectData: offlineCacheUtils.getProjectData,
      updateEntries: updateEntries,
      updateProjectData: offlineCacheUtils.updateProjectData,
      deleteEntry: deleteEntry,
      canCache: offlineCache.canCache
    };
  }]);

