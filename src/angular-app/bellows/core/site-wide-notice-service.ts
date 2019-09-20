import * as angular from 'angular';

import { NoticeModule } from './notice/notice.module';
import { NoticeService } from './notice/notice.service';
import { UtilityService } from './utility.service';

export class SiteWideNoticeService {
  static $inject: string[] = ['silNoticeService'];
  static message: string = 'It looks like you\'re using Internet Explorer. ' +
  'This website is not designed for Internet Explorer, and some things may not work as expected. ' +
  'Please use a different browser (such as <a href="https://www.microsoft.com/windows/microsoft-edge">Edge</a>, ' +
  '<a href="https://mozilla.org/firefox">Firefox</a>, or <a href="https://google.com/chrome">Chrome</a>) ' +
  'to browse this site.';

  constructor(private noticeService: NoticeService) { }

  displayNotices() {
    if (UtilityService.isIE(window.navigator.userAgent)) {
      this.noticeService.push(this.noticeService.ERROR, SiteWideNoticeService.message);
    }
  }
}

export const SiteWideNoticeModule = angular
  .module('siteWideNoticeModule', [NoticeModule])
  .service('siteWideNoticeService', SiteWideNoticeService)
  .name;
