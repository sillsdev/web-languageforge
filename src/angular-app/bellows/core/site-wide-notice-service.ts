import * as angular from 'angular';

import { NoticeModule } from './notice/notice.module';
import { NoticeService } from './notice/notice.service';
import { SessionService } from './session.service';
import { UtilityService } from './utility.service';

export class SiteWideNoticeService {
  static $inject: string[] = ['silNoticeService', 'sessionService', '$http'];
  static ieMessage: string = 'It looks like you\'re using Internet Explorer. ' +
    'This website is not designed for Internet Explorer, and some things may not work as expected. ' +
    'Please use a different browser (such as <a href="https://www.microsoft.com/windows/microsoft-edge">Edge</a>, ' +
    '<a href="https://mozilla.org/firefox">Firefox</a>, or <a href="https://google.com/chrome">Chrome</a>) ' +
    'to browse this site.';

  constructor(
    private noticeService: NoticeService,
    private sessionService: SessionService,
    private $http: angular.IHttpService
  ) { }

  async displayNotices() {
    if (UtilityService.isIE(window.navigator.userAgent)) {
      this.noticeService.push(this.noticeService.ERROR, SiteWideNoticeService.ieMessage);
    }

    const site = (await this.sessionService.getSession()).baseSite();
    // using await instead of then seems to prevent the digest cycle from running
    this.$http.get('/site_wide_notices.json').then(notices => {
      for (const notice of notices.data as any[]) {
        if (notice.site === site) this.noticeService.push(this.noticeService.INFO, notice.message);
      }
    });
  }
}

export const SiteWideNoticeModule = angular
  .module('siteWideNoticeModule', [NoticeModule])
  .service('siteWideNoticeService', SiteWideNoticeService)
  .name;
