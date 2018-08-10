import * as angular from 'angular';
import * as localforage from 'localforage';

/**
 * implements an offline cache storage system
 */
export class OfflineCacheService {
  static readonly version = 6;

  private stores: { [storeName: string]: LocalForage } = {};

  static $inject: string[] = ['$q'];
  constructor(private $q: angular.IQService) { }

  static canCache(): boolean {
    return localforage.supports(localforage.INDEXEDDB) || localforage.supports(localforage.WEBSQL);
  }

  deleteObjectInStore(storeName: string, key: string): angular.IPromise<any> {
    return this.$q.when(this.getStore(storeName).removeItem(key));
  }

  getAllFromStore(storeName: string, projectId?: string): angular.IPromise<any> {
    const results: any[] = [];
    return this.$q.when(this.getStore(storeName).iterate<any, any>(value => {
      if (projectId == null || value.projectId === projectId) {
        results.push(OfflineCacheService.removeProjectId(value));
      }
    }).then(() => {
      return results;
    }));
  }

  getOneFromStore(storeName: string, key: string): angular.IPromise<any> {
    return this.$q.when(this.getStore(storeName).getItem(key).then(item => {
      return OfflineCacheService.removeProjectId(item);
    }));
  }

  setObjectsInStore(storeName: string, projectId: string, items: any[]): angular.IPromise<any[]> {
    const store: LocalForage = this.getStore(storeName);
    return this.$q.all(items.map(item => {
      return store.setItem(item.id, OfflineCacheService.addProjectId(item, projectId));
    }));
  }

  setObjectInStore(storeName: string, projectId: string, item: any): angular.IPromise<any> {
    const store: LocalForage = this.getStore(storeName);
    return this.$q.when(store.setItem(item.id, OfflineCacheService.addProjectId(item, projectId)));
  }

  private getStore(storeName: string): LocalForage {
    if (!this.stores[storeName]) {
      this.stores[storeName] = localforage.createInstance({
        name: storeName
      });
    }
    return this.stores[storeName];
  }

  private static addProjectId(object: any, projectId: string) {
    if (object.projectId !== projectId) {
      object = angular.copy(object);
      object.projectId = projectId;
    }
    return object;
  }

  private static removeProjectId(object: any) {
    delete object.projectId;
    return object;
  }

}
