import * as angular from 'angular';

import { CommentsOfflineCacheService } from './comments-offline-cache.service';
import { DocumentsOfflineCacheService } from './documents-offline-cache.service';
import { EditorDataService } from './editor-data.service';
import { EditorOfflineCacheService } from './editor-offline-cache.service';
import { LexiconCommentService } from './lexicon-comments.service';
import { OfflineCacheUtilsService } from './offline-cache-utils.service';
import { OfflineCacheService } from './offline-cache.service';

export const OfflineModule = angular
  .module('offlineModule', [])
  .service('commentsOfflineCache', CommentsOfflineCacheService)
  .service('editorDataService', EditorDataService)
  .service('editorOfflineCache', EditorOfflineCacheService)
  .service('lexCommentService', LexiconCommentService)
  .service('offlineCacheUtils', OfflineCacheUtilsService)
  .service('offlineCache', OfflineCacheService)
  .service('documentsOfflineCache', DocumentsOfflineCacheService)
  .name;
