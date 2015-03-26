'use strict';

angular.module('bellows.services')
/**
 * implements an offline cache storage system
 *
 *
 */
  .factory('offlineCache', ['$window', '$q', 'sessionService', function($window, $q, sessionService) {
    var indexedDB = $window.indexedDB;
    var dbName = 'xforgeCache';
    var db = null;
    var projectId = sessionService.session.project.id;

    /**
     *
     * @returns {boolean}
     */
    var canCache = function canCache() {
      return Boolean(indexedDB);
    };

    /**
     * @return a promise
     */
    var openDbIfNecessary = function openDbIfNecessary() {
      var deferred = $q.defer();
      var version = 2;
      if (db == null) {
        var request = indexedDB.open(dbName, version);

        // migration and database setup
        request.onupgradeneeded = function(e) {
          db = e.target.result;

          e.target.transaction.onerror = indexedDB.onerror;

          // get rid of old 'cached' store - no longer used - cjh 2015-03
          if (db.objectStoreNames.contains('cached')) {
            db.deleteObjectStore('cached');
          }

          var entriesStore = db.createObjectStore('entries', {keyPath: "id"});
          entriesStore.createIndex('projectId', 'projectId', { unique: false });

          var commentsStore = db.createObjectStore('comments', {keyPath: "id"});
          commentsStore.createIndex('projectId', 'projectId', { unique: false });

          var actionsStore = db.createObjectStore('offlineActions', {keyPath: "id"});
          actionsStore.createIndex('projectId', 'projectId', { unique: false });

          var projectsStore = db.createObjectStore('projects', {keyPath: "id"});
        };

        request.onsuccess = function(e) {
          db = e.target.result;
          deferred.resolve();
        };

        request.onerror = function(e) {
          deferred.reject("Error: opening database. " + e.value);
        }

      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };

    /**
     *
     * @param storeName
     * @param objects - array of objects to set
     * @param isAdd
     * @returns {*}
     */
    function setObjectsInStore(storeName, items, isAdd) {
      var isAdd = isAdd || false;
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        var request;
        var trans = db.transaction([storeName], "readwrite");

        var store = trans.objectStore(storeName);

        // inspired by: http://stackoverflow.com/questions/10471759/inserting-large-quantities-in-indexeddbs-objectstore-blocks-ui
        var i = 0;
        function insertNext() {
          if (i<items.length) {
            //console.log("insert into " + storeName + " item " + (i + 1) + " of " + items.length);
            items[i].projectId = projectId;
            store.put(items[i]).onsuccess = insertNext;
            if (isAdd) {
              request = store.add(items[i]);
            } else {
              request = store.put(items[i]);
            }
            request.onsuccess = insertNext;
            request.onerror = function(e) {
              deferred.reject("Could not persist object in " + storeName);
            };
            ++i;
          } else {   // complete
            deferred.resolve(true);
          }
        }
        insertNext();

      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function deleteObjectInStore(storeName, id) {
    }

    function getAllFromStore(storeName) {
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        var entries = [];
        var index = db.transaction(storeName).objectStore(storeName).index('projectId');
        var cursorRequest = index.openCursor(IDBKeyRange.only(projectId));
        cursorRequest.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            entries.push(cursor.value);
            // should be  cursor.continue(); but needed a work around to work with the yui compressor - cjh 2015-03
            cursor["continue"]();
          } else {
            if (entries.length == 0) {
              //console.log("offline cache getAll" + storeName + " MISS for project = " + projectId);
            }
            deferred.resolve(entries);
          }
        };
        cursorRequest.onerror = function (e) {
          console.log(e.value);
          deferred.reject("Error: cursor failed in getAll" + storeName);
        };
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    function getOneFromStore(storeName, key) {
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        var request = db.transaction(storeName).objectStore(storeName).get(key);
        request.onsuccess = function(e) {
          if (e.target.result) {
            deferred.resolve(e.target.result);
          } else {
            deferred.reject();
          }
        };
        request.onerror = function(e) {
          deferred.reject(e.value);
        };
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    }

    var getAllEntries = function getAllEntries() {
      return getAllFromStore('entries');
    };

    var getAllComments = function getAllComments() {
      return getAllFromStore('comments');
    };

    var getAllOfflineActions = function getAllOfflineActions() {
      return getAllFromStore('offlineActions');
    };

    /**
     *
     * @param entries - array
     * @returns {promise}
     */
    var updateEntries = function updateEntries(entries) {
      return setObjectsInStore('entries', entries);
    };

    var updateComments = function updateComments(comments) {
      return setObjectsInStore('comments', comments);
    };

    var addOfflineAction = function addOfflineAction(action) {
      return setObjectsInStore('offlineActions', [action], true);
    };

    var deleteOfflineAction = function deleteOfflineAction(id) {
      return deleteObjectInStore('offlineActions', id);
    };

    var updateProjectData = function updateProject(timestamp, commentsUserPlusOne, isComplete) {
      var obj = {
        id: projectId,
        commentsUserPlusOne: commentsUserPlusOne,
        timestamp: timestamp,
        isComplete: isComplete
      };
      return setObjectsInStore('projects', [obj]);
    };

    var getProjectData = function getProjectData() {
      return getOneFromStore('projects', projectId);
    };

    return {
      getAllEntries: getAllEntries,
      getAllComments: getAllComments,
      getAllOfflineActions: getAllOfflineActions,
      getProjectData: getProjectData,
      updateEntries: updateEntries,
      updateComments: updateComments,
      addOfflineAction: addOfflineAction,
      deleteOfflineAction: deleteOfflineAction,
      updateProjectData: updateProjectData,
      canCache: canCache
    };
  }]);

