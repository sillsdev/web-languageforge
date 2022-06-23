import * as angular from 'angular';

import {ShareWithOthersModule} from '../../languageforge/lexicon/shared/share-with-others/share-with-others.module';
import {InterfaceLanguageModule} from '../shared/interface-language.component';
import {ApiService} from './api/api.service';
import {JsonRpcModule} from './api/json-rpc.service';
import {ProjectService} from './api/project.service';
import {UserService} from './api/user.service';
import {RolesService} from './api/roles.service';
import {ApplicationHeaderService} from './application-header.service';
import {ExceptionOverrideModule} from './exception-handling.service';
import {BytesFilter, EncodeURIFilter, RelativeTimeFilter} from './filters';
import {LinkService} from './link.service';
import {ModalService} from './modal/modal.service';
import {NavbarController} from './navbar.controller';
import {NoticeService} from './notice/notice.service';
import {OfflineModule} from './offline/offline.module';
import {SessionService} from './session.service';
import {UtilityService} from './utility.service';

export const CoreModule = angular
  .module('coreModule', [
    JsonRpcModule,
    OfflineModule,
    ExceptionOverrideModule,
    InterfaceLanguageModule,
    ShareWithOthersModule
  ])
  .service('projectService', ProjectService)
  .service('userService', UserService)
  .service('rolesService', RolesService)
  .service('apiService', ApiService)
  .service('sessionService', SessionService)
  .service('modalService', ['$uibModal', ModalService])
  .service('linkService', LinkService)
  .service('applicationHeaderService', ApplicationHeaderService)
  .service('utilService', UtilityService)
  .service('noticeService', NoticeService)
  .filter('bytes', BytesFilter)
  .filter('relativetime', RelativeTimeFilter)
  .filter('encodeURI', ['$window', EncodeURIFilter])
  .controller('navbarController', NavbarController)
  .name;
