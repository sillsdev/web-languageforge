import * as angular from 'angular';

import { CoreModule } from '../core.module';
import { NoticeComponent } from './notice.component';
import { NoticeService } from './notice.service';

export const NoticeServiceModule = angular
  .module('palaso.ui.notice', ['ngSanitize', CoreModule])
  .component('silNotices', NoticeComponent)
  .service('silNoticeService', NoticeService)
  .name;
