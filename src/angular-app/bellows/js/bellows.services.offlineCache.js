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
    var storeName = 'cached';
    var db = null;

    /**
     *
     * @returns {boolean}
     */
    var canCache = function canCache() {
      return Boolean(indexedDB);
    };

    /**
     *
     * @param key - unique key for this object
     * @return a promise, resolving to a result object like:
     *   {
     *   key: ,
     *   timestamp: ,
     *   data:
     *   }
     */
    var getObject = function getObject(key) {
      console.log("offline cache getObject called");
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        var request = db.transaction(storeName).objectStore(storeName).get(key);
        request.onsuccess = function(e) {
          if (e.target.result) {
            console.log("offline cache getObject HIT for key= " + key);
            console.log(e.target.result);
            deferred.resolve(e.target.result);
          } else {
            console.log("offline cache getObject MISS for key= " + key);
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
    };

    /**
     *
     * @param key - unique key for this object
     * @param timestamp - timestamp of the cached object - epoch time
     * @param data - data blob
     * @return a promise, resolving to true on success
     */
    var setObject = function setObject(key, timestamp, data) {
      var deferred = $q.defer();
      openDbIfNecessary().then(function() {
        var trans = db.transaction([storeName], "readwrite");

        var store = trans.objectStore(storeName);

        var dataToPersist = {
          "id" : key,
          "timestamp" : timestamp,
          "data" : data
        };
        var request = store.put(dataToPersist);
        request.onsuccess = function(e) {
          console.log("offline cache setObject success for key= " + key + " , timestamp= " + timestamp);
          deferred.resolve(true);
        };
        request.onerror = function(e) {
          deferred.reject("Could not persist object in " + storeName);
        };
      }, function(error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    /**
     * @return a promise
     */
    var openDbIfNecessary = function openDb() {
      var deferred = $q.defer();
      var version = 1;
      if (db == null) {
        var request = indexedDB.open(dbName, version);
        request.onupgradeneeded = function(e) {
          db = e.target.result;

          e.target.transaction.onerror = indexedDB.onerror;

          if (db.objectStoreNames.contains(dbName)) {
            db.deleteObjectStore(storeName);
          }
          db.createObjectStore(storeName, {keyPath: "id"});
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

    return {
      canCache: canCache,
      getObject: getObject,
      setObject: setObject
    };
  }]);

