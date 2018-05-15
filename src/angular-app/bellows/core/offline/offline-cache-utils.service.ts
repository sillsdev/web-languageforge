import * as angular from 'angular';

import { SessionService } from '../session.service';
import { OfflineCacheService } from './offline-cache.service';

export interface VotesDto { [id: string]: boolean; }

export class OfflineCacheUtilsService {
  static $inject: string[] = ['sessionService', 'offlineCache'];
  constructor(private sessionService: SessionService, private offlineCache: OfflineCacheService) { }

  getProjectData(): angular.IPromise<any> {
    return this.offlineCache.getOneFromStore('projects', this.sessionService.projectId());
  }

  updateProjectData(timestamp: number, commentsUserPlusOne: VotesDto, isComplete: boolean): angular.IPromise<any> {
    const obj = {
      id: this.sessionService.projectId(),
      commentsUserPlusOne,
      timestamp,
      isComplete
    };
    return this.offlineCache.setObjectsInStore('projects', this.sessionService.projectId(), [obj]);
  }

}
