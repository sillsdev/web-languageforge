import * as angular from 'angular';

/**
 * implements an offline cache storage system
 */
export class OfflineCacheService {
  readonly dbName = 'xforgeCache';
  readonly version = 6;
  readonly indexedDB: any = this.$window.indexedDB;

  db: any = null;

  static $inject: string[] = ['$q', '$window'];
  constructor(private $q: angular.IQService, private $window: angular.IWindowService) { }

  canCache = (): boolean => {
    return Boolean(this.indexedDB);
  }

  deleteObjectInStore = (storeName: string, key: string): angular.IPromise<any> => {
    // cjh 2015-03 it seems to me from the spec that we can call "delete" without first checking if the id exists
    // http://www.w3.org/TR/IndexedDB/#dfn-steps-for-deleting-records-from-an-object-store
    const deferred = this.$q.defer();
    this.openDbIfNecessary().then(() => {
      // we write ['delete'] to satisfy the yui compressor - arg! - time to get a new compressor - cjh 2015-03
      const request = this.db.transaction(storeName, 'readwrite').objectStore(storeName).delete(key);
      request.onsuccess = () => {
        deferred.resolve(true);
      };

      request.onerror = (e: any) => {
        deferred.reject(e.value);
      };
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  getAllFromStore = (storeName: string, projectId?: string): angular.IPromise<any> => {
    const deferred = this.$q.defer();
    this.openDbIfNecessary().then(() => {
      const items: any[] = [];
      const objectStore = this.db.transaction(storeName).objectStore(storeName);
      // console.log("open index projectId for storeName = " + storeName);
      const index = objectStore.index('projectId');
      // console.log("open cursor for index on storeName = " + storeName);
      const cursorRequest = index.openCursor(IDBKeyRange.only(projectId));

      cursorRequest.onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          if (angular.isDefined(cursor.value.projectId)) delete cursor.value.projectId;
          items.push(cursor.value);

          // should be cursor.continue(); but needed a work around to work with the yui compressor - cjh 2015-03
          cursor.continue();
        } else {
          deferred.resolve(items);
        }
      };

      cursorRequest.onerror = (e: any) => {
        console.log(e.value);
        deferred.reject('Error: cursor failed in getAll' + storeName);
      };
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  getOneFromStore = (storeName: string, key: string): angular.IPromise<any> => {
    const deferred = this.$q.defer();
    this.openDbIfNecessary().then(() => {
      const request = this.db.transaction(storeName).objectStore(storeName).get(key);
      request.onsuccess = (e: any) => {
        if (e.target.result) {
          if (angular.isDefined(e.target.result.projectId)) delete e.target.result.projectId;
          deferred.resolve(e.target.result);
        } else {
          deferred.reject();
        }
      };

      request.onerror = (e: any) => {
        deferred.reject(e.value);
      };
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  setObjectsInStore = (storeName: string, projectId: string, items: any[],
                       isAdd: boolean = false): angular.IPromise<any> => {
    const deferred = this.$q.defer();
    this.openDbIfNecessary().then(() => {
      let request;
      const trans = this.db.transaction([storeName], 'readwrite');
      const store = trans.objectStore(storeName);

      // http://stackoverflow.com/questions/10471759/inserting-large-quantities-in-indexeddbs-objectstore-blocks-ui
      let i = 0;
      function insertNext() {
        if (i < items.length) {
          const item = angular.copy(items[i]);
          item.projectId = projectId;
          store.put(items[i]).onsuccess = insertNext;
          if (isAdd) {
            request = store.add(item);
          } else {
            request = store.put(item);
          }

          request.onsuccess = insertNext;
          request.onerror = () => {
            deferred.reject('Could not persist object in ' + storeName);
          };

          ++i;
        } else {   // complete
          deferred.resolve(true);
        }
      }

      insertNext();
    }, error => {
      deferred.reject(error);
    });

    return deferred.promise;
  }

  private openDbIfNecessary(): angular.IPromise<any> {
    const deferred = this.$q.defer();
    if (this.db === null) {
      const request = this.indexedDB.open(this.dbName, this.version);

      // migration and database setup
      request.onupgradeneeded = (e: any) => {
        this.db = e.target.result;

        e.target.transaction.onerror = this.indexedDB.onerror;

        // get rid of old stores - no longer used - cjh 2015-03
        if (this.db.objectStoreNames.contains('cached')) {
          this.db.deleteObjectStore('cached');
        }

        if (this.db.objectStoreNames.contains('offlineActions')) {
          this.db.deleteObjectStore('offlineActions');
        }

        if (this.db.objectStoreNames.contains('entries')) {
          this.db.deleteObjectStore('entries');
        }

        const entriesStore = this.db.createObjectStore('entries', { keyPath: 'id' });
        entriesStore.createIndex('projectId', 'projectId', { unique: false });

        if (this.db.objectStoreNames.contains('comments')) {
          this.db.deleteObjectStore('comments');
        }

        const commentsStore = this.db.createObjectStore('comments', { keyPath: 'id' });
        commentsStore.createIndex('projectId', 'projectId', { unique: false });

        if (this.db.objectStoreNames.contains('workingsets')) {
          this.db.deleteObjectStore('workingsets');
        }

        const workingsetStore = this.db.createObjectStore('workingsets', { keyPath: 'id' });
        workingsetStore.createIndex('projectId', 'projectId', { unique: false });

        if (this.db.objectStoreNames.contains('projects')) {
          this.db.deleteObjectStore('projects');
        }

        const projectsStore = this.db.createObjectStore('projects', { keyPath: 'id' });
        projectsStore.createIndex('projectId', 'projectId', { unique: true });
      };

      request.onsuccess = (e: any) => {
        this.db = e.target.result;
        deferred.resolve();
      };

      request.onerror = (e: any) => {
        deferred.reject('Error: opening database. ' + e.value);
      };

    } else {
      deferred.resolve();
    }

    return deferred.promise;
  }

}
