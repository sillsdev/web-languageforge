'use strict';

angular.module('bellows.services')
/**
 * implements an offline cache storage system
 */
  .factory('editorOfflineCache', ['$window', '$q', 'sessionService', 'offlineCache',
    'offlineCacheUtils',
  function ($window, $q, sessionService, offlineCache, offlineCacheUtils) {

    function getAllEntries() {
      return offlineCache.getAllFromStore('entries', sessionService.projectId());
    }

    function deleteEntry(id) {
      return offlineCache.deleteObjectInStore('entries', id);
    }

    /**
     * @param {array} entries
     * @returns {promise}
     */
    function updateEntries(entries) {
      return offlineCache.setObjectsInStore('entries', sessionService.projectId(), entries);
    }

    return {
      getAllEntries: getAllEntries,
      getProjectData: offlineCacheUtils.getProjectData,
      updateEntries: updateEntries,
      updateProjectData: offlineCacheUtils.updateProjectData,
      deleteEntry: deleteEntry,
      canCache: offlineCache.canCache
    };
  }]);

