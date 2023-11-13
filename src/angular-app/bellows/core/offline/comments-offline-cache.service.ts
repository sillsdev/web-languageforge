import * as angular from 'angular';

import { SessionService } from '../session.service';
import { OfflineCacheUtilsService } from './offline-cache-utils.service';
import { OfflineCacheService } from './offline-cache.service';

export class CommentsOfflineCacheService {
  static $inject: string[] = ['sessionService', 'offlineCache', 'offlineCacheUtils'];
  constructor(private sessionService: SessionService, private offlineCache: OfflineCacheService,
              private offlineCacheUtils: OfflineCacheUtilsService) { }

  deleteComment(id: string): angular.IPromise<any> {
    return this.offlineCache.deleteObjectInStore('comments', id);
  }

  deleteAllComments(): angular.IPromise<any> {
    return this.offlineCache.clearEntireStore('comments');
  }

  getAllComments(): angular.IPromise<any> {
    return this.offlineCache.getAllFromStore('comments', this.sessionService.projectId());
  }

  getProjectData = this.offlineCacheUtils.getProjectData;

  updateComments(comments: any): angular.IPromise<any> {
    return this.offlineCache.setObjectsInStore('comments', this.sessionService.projectId(), comments);
  }

  updateProjectData = this.offlineCacheUtils.updateProjectData;

}
