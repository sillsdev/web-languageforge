import * as angular from 'angular';

import { SessionService } from '../session.service';
import { OfflineCacheUtilsService } from './offline-cache-utils.service';
import { OfflineCacheService } from './offline-cache.service';

export class EditorOfflineCacheService {
  static $inject: string[] = ['sessionService', 'offlineCache', 'offlineCacheUtils'];
  constructor(private sessionService: SessionService, private offlineCache: OfflineCacheService,
              private offlineCacheUtils: OfflineCacheUtilsService) { }

  canCache = OfflineCacheService.canCache;

  deleteEntry(id: string): angular.IPromise<any> {
    return this.offlineCache.deleteObjectInStore('entries', id);
  }

  deleteAllEntries(): angular.IPromise<any> {
    return this.offlineCache.clearEntireStore('entries');
  }

  getAllEntries(): angular.IPromise<any> {
    return this.offlineCache.getAllFromStore('entries', this.sessionService.projectId());
  }

  getProjectData = this.offlineCacheUtils.getProjectData;

  updateEntries(entries: any): angular.IPromise<any> {
    return this.offlineCache.setObjectsInStore('entries', this.sessionService.projectId(), entries);
  }

  updateProjectData = this.offlineCacheUtils.updateProjectData;

}
