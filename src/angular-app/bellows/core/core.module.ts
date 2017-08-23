import * as angular from 'angular';

import { ApiService } from  './api.service';
import { BytesFilter, RelativeTimeFilter } from './filters';
import { ModalService } from './modal/modal.service';
import { OfflineCacheService } from './offline-cache.service';
import { ProjectService } from './project.service';
import { SessionService } from './session.service';
import { UtilityService } from './utility.service';

import './notice/notice.module';
import './error.service';
import './json-rpc.service';

export const CoreModule = angular
  .module('coreModule', [])
  .service('projectService', ProjectService)
  .service('apiService', ApiService)
  .service('sessionService', SessionService)
  .service('modalService', ['$uibModal', ModalService])
  .service('offlineCache', ['$window', '$q', OfflineCacheService])
  .service('utilService', UtilityService)
  .filter('bytes', BytesFilter)
  .filter('relativetime', RelativeTimeFilter)
  .name;
