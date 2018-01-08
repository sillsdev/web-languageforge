import * as angular from 'angular';

import { ActivityService } from './api/activity.service';
import { ApiService } from './api/api.service';
import { JsonRpcModule } from './api/json-rpc.service';
import { ProjectService } from './api/project.service';
import { RestApiService } from './api/rest-api.service';
import { UserRestApiService } from './api/user-rest-api.service';
import { UserService } from './api/user.service';
import {BytesFilter, EncodeURIFilter, RelativeTimeFilter} from './filters';
import { LinkService } from './link.service';
import { ModalService } from './modal/modal.service';
import { OfflineModule } from './offline/offline.module';
import { SessionService } from './session.service';
import { UtilityService } from './utility.service';
import { NoticeService } from './notice/notice.service';

export const CoreModule = angular
  .module('coreModule', [JsonRpcModule, OfflineModule])
  .service('projectService', ProjectService)
  .service('userService', UserService)
  .service('activityService', ActivityService)
  .service('apiService', ApiService)
  .service('sessionService', SessionService)
  .service('modalService', ['$uibModal', ModalService])
  .service('linkService', LinkService)
  .service('utilService', UtilityService)
  .service('restApiService', RestApiService)
  .service('noticeService', NoticeService)
  .service('userRestApiService', UserRestApiService)
  .filter('bytes', BytesFilter)
  .filter('relativetime', RelativeTimeFilter)
  .filter('encodeURI', ['$window', EncodeURIFilter])
  .name;
