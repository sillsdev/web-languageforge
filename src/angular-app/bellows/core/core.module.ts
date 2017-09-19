import * as angular from 'angular';

import { ApiService } from './api/api.service';
import { ProjectService } from './api/project.service';
import { UserService } from './api/user.service';
import { BytesFilter, RelativeTimeFilter } from './filters';
import { LinkService } from './link.service';
import { ModalService } from './modal/modal.service';
import { OfflineCacheService } from './offline-cache.service';
import { SessionService } from './session.service';
import { UtilityService } from './utility.service';

import './api/json-rpc.service';
import './breadcrumbs/breadcrumb.module'
import './error.service';
import './notice/notice.module';

export const CoreModule = angular
  .module('coreModule', [])
  .service('projectService', ProjectService)
  .service('userService', UserService)
  .service('apiService', ApiService)
  .service('sessionService', SessionService)
  .service('modalService', ['$uibModal', ModalService])
  .service('offlineCache', ['$window', '$q', OfflineCacheService])
  .service('linkService', LinkService)
  .service('utilService', UtilityService)
  .filter('bytes', BytesFilter)
  .filter('relativetime', RelativeTimeFilter)
  .name;
