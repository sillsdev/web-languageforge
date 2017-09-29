import * as angular from 'angular';

import { NoticeComponent } from './notice.component';
import { NoticeService } from './notice.service';

export const NoticeModule = angular
  .module('palaso.ui.notice', ['ngSanitize'])
  .component('silNotices', NoticeComponent)
  .service('silNoticeService', NoticeService)
  .name;
