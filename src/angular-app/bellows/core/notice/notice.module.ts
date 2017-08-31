import * as angular from 'angular';

import { noticeComponent } from './notice.component';
import { NoticeService } from './notice.service';

angular.module('palaso.ui.notice', ['ngSanitize', 'coreModule'])
  .component('silNotices', noticeComponent)
  .service('silNoticeService', NoticeService)

  ;
