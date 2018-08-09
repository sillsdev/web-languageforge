import * as angular from 'angular';
import { Snapshot } from 'sharedb/lib/client';

import { SessionService } from '../session.service';
import { OfflineCacheService } from './offline-cache.service';

export class DocumentCacheData implements Snapshot {
  id: string;
  v: number;
  data: any;
  type: string;
}

export class DocumentsOfflineCacheService {
  static readonly STORE_NAME = 'documents';

  static $inject: string[] = ['sessionService', 'offlineCache'];
  constructor(private sessionService: SessionService, private readonly offlineCache: OfflineCacheService) { }

  static canCache(): boolean {
    return OfflineCacheService.canCache();
  }

  getDocument(id: string): angular.IPromise<DocumentCacheData> {
    return this.offlineCache.getOneFromStore(DocumentsOfflineCacheService.STORE_NAME, id);
  }

  updateDocument(doc: DocumentCacheData): angular.IPromise<DocumentCacheData> {
    return this.offlineCache.setObjectInStore(DocumentsOfflineCacheService.STORE_NAME, this.sessionService.projectId(),
      doc);
  }
}
