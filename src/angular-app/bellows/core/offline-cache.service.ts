import * as angular from 'angular';

/**
 * implements an offline cache storage system
 */
// FixMe: when change to class, get console error "Possibly unhandled rejection"
// See https://github.com/angular-ui/ui-router/issues/2889 to determine source
//   .service('offlineCache', ['$window', '$q',
export function OfflineCacheService($window: angular.IWindowService, $q: angular.IQService) {
  const dbName = 'xforgeCache';
  const version = 5;

  let indexedDB: any = $window.indexedDB;
  let db: any = null;

  this.canCache = function canCache(): boolean {
    return Boolean(indexedDB);
  };

  /**
   * @return a promise
   */
  function openDbIfNecessary() {
    let deferred = $q.defer();
    if (db === null) {
      let request = indexedDB.open(dbName, version);

      // migration and database setup
      request.onupgradeneeded = function (e: any) {
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

        let entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
        entriesStore.createIndex('projectId', 'projectId', { unique: false });

        if (db.objectStoreNames.contains('comments')) {
          db.deleteObjectStore('comments');
        }

        let commentsStore = db.createObjectStore('comments', { keyPath: 'id' });
        commentsStore.createIndex('projectId', 'projectId', { unique: false });

        if (db.objectStoreNames.contains('workingsets')) {
          db.deleteObjectStore('workingsets');
        }

        let workingsetStore = db.createObjectStore('workingsets', { keyPath: 'id' });
        workingsetStore.createIndex('projectId', 'projectId', { unique: false });

        if (db.objectStoreNames.contains('projects')) {
          db.deleteObjectStore('projects');
        }

        db.createObjectStore('projects', { keyPath: 'id' });
      };

      request.onsuccess = function (e: any) {
        db = e.target.result;
        deferred.resolve();
      };

      request.onerror = function (e: any) {
        deferred.reject('Error: opening database. ' + e.value);
      };

    } else {
      deferred.resolve();
    }

    return deferred.promise;
  }

  /**
   * @param {string} storeName
   * @param {string} projectId
   * @param {array} items - array of objects to set
   * @param {boolean} isAdd
   * @returns {*}
   */
  this.setObjectsInStore = function setObjectsInStore(storeName: string, projectId: string, items: any[], isAdd: boolean = false) {
    let deferred = $q.defer();
    openDbIfNecessary().then(function () {
      let request;
      let trans = db.transaction([storeName], 'readwrite');

      let store = trans.objectStore(storeName);

      // inspired by: http://stackoverflow.com/questions/10471759/inserting-large-quantities-in-indexeddbs-objectstore-blocks-ui
      let i = 0;
      function insertNext() {
        if (i < items.length) {
          let item = angular.copy(items[i]);
          item.projectId = projectId;
          store.put(items[i]).onsuccess = insertNext;
          if (isAdd) {
            request = store.add(item);
          } else {
            request = store.put(item);
          }

          request.onsuccess = insertNext;
          request.onerror = function () {
            deferred.reject('Could not persist object in ' + storeName);
          };

          ++i;
        } else {   // complete
          deferred.resolve(true);
        }
      }

      insertNext();

    }, function (error) {

      deferred.reject(error);
    });

    return deferred.promise;
  };

  this.deleteObjectInStore = function deleteObjectInStore(storeName: string, key: string) {
    // cjh 2015-03 it seems to me from the spec that we can call "delete" without first checking
    // if the id exists
    // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-deleting-records-from-an-object-store
    let deferred = $q.defer();
    openDbIfNecessary().then(function () {
      // we write ['delete'] to satisfy the yui compressor - arg! - time to get a new compressor -
      // cjh 2015-03
      let request = db.transaction(storeName, 'readwrite').objectStore(storeName)['delete'](key);
      request.onsuccess = function () {
        deferred.resolve(true);
      };

      request.onerror = function (e: any) {
        deferred.reject(e.value);
      };
    }, function (error) {

      deferred.reject(error);
    });

    return deferred.promise;

  };

  this.getAllFromStore = function getAllFromStore(storeName: string, projectId: string) {
    let deferred = $q.defer();
    openDbIfNecessary().then(function () {
      let items: any[] = [];
      let index = db.transaction(storeName).objectStore(storeName).index('projectId');
      let cursorRequest = index.openCursor(IDBKeyRange.only(projectId));

      cursorRequest.onsuccess = function (e: any) {
        let cursor = e.target.result;
        if (cursor) {
          if (angular.isDefined(cursor.value.projectId)) delete cursor.value.projectId;
          items.push(cursor.value);

          // should be cursor.continue(); but needed a work around to work with the yui
          // compressor - cjh 2015-03
          cursor['continue']();
        } else {
          deferred.resolve(items);
        }
      };

      cursorRequest.onerror = function (e: any) {
        console.log(e.value);
        deferred.reject('Error: cursor failed in getAll' + storeName);
      };
    }, function (error) {

      deferred.reject(error);
    });

    return deferred.promise;
  };

  this.getOneFromStore = function getOneFromStore(storeName: string, key: string) {
    let deferred = $q.defer();
    openDbIfNecessary().then(function () {
      let request = db.transaction(storeName).objectStore(storeName).get(key);
      request.onsuccess = function (e: any) {
        if (e.target.result) {
          if (angular.isDefined(e.target.result.projectId)) delete e.target.result.projectId;
          deferred.resolve(e.target.result);
        } else {
          deferred.reject();
        }
      };

      request.onerror = function (e: any) {
        deferred.reject(e.value);
      };
    }, function (error) {

      deferred.reject(error);
    });

    return deferred.promise;
  };

}
