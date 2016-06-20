'use strict';

angular.module('bellows.services')
/**
 * implements an offline cache storage system
 *
 *
 */
  .factory('offlineCache', ['$window', '$q', function($window, $q) {
    var indexedDB = $window.indexedDB;
    var dbName = 'xforgeCache';
    var db = null;

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
      var version = 4;
      if (db == null) {
        var request = indexedDB.open(dbName, version);

        // migration and database setup
        request.onupgradeneeded = function(e) {
          db = e.target.result;

          e.target.transaction.onerror = indexedDB.onerror;

          // get rid of old stores - no longer used - cjh 2015-03
          if (db.objectStoreNames.contains('cached')) {
            db.deleteObjectStore('cached');
          }
          if (db.objectStoreNames.contains('offlineActions')) {
            db.deleteObjectStore('offlineActions');
          }


          if (db.objectStoreNames.contains('entries')) {
            db.deleteObjectStore('entries');
          }
          var entriesStore = db.createObjectStore('entries', {keyPath: "id"});
          entriesStore.createIndex('projectId', 'projectId', { unique: false });

          if (db.objectStoreNames.contains('comments')) {
            db.deleteObjectStore('comments');
          }
          var commentsStore = db.createObjectStore('comments', {keyPath: "id"});
          commentsStore.createIndex('projectId', 'projectId', { unique: false });

          if (db.objectStoreNames.contains('workingsets')) {
            db.deleteObjectStore('workingsets');
          }
          var workingsetStore = db.createObjectStore('workingsets', {keyPath: "id"});
          workingsetStore.createIndex('projectId', 'projectId', { unique: false });
          
          if (db.objectStoreNames.contains('projects')) {
            db.deleteObjectStore('projects');
          }
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
    function setObjectsInStore(storeName, projectId, items, isAdd) {
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

    function deleteObjectInStore(storeName, key) {
      // cjh 2015-03 it seems to me from the spec that we can call "delete" without first checking if the id exists
      // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-deleting-records-from-an-object-store
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        // we write ['delete'] to satisfy the yui compressor - arg! - time to get a new compressor - cjh 2015-03
        var request = db.transaction(storeName, "readwrite").objectStore(storeName)['delete'](key);
        request.onsuccess = function(e) {
          deferred.resolve(true);
        };
        request.onerror = function(e) {
          deferred.reject(e.value);
        };
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;

    }

    function getAllFromStore(storeName, projectId) {
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


    return {
      setObjectsInStore: setObjectsInStore,
      deleteObjectInStore: deleteObjectInStore,
      getAllFromStore: getAllFromStore,
      getOneFromStore: getOneFromStore,
      canCache: canCache
    };
  }]);

