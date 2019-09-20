import * as angular from 'angular';

import { NoticeModule } from './notice/notice.module';
import { NoticeService, NoticeType } from './notice/notice.service';
import { SessionService } from './session.service';
import { UtilityService } from './utility.service';

interface SiteWideNotice {
  site: string;
  type: NoticeType;
  message: string;
}

export class SiteWideNoticeService {
  static $inject: string[] = ['silNoticeService', 'sessionService', '$http'];
  static ieMessage: string = 'It looks like you\'re using Internet Explorer. ' +
    'This website is not designed for Internet Explorer, and some things may not work as expected. ' +
    'Please use a different browser (such as <a href="https://www.microsoft.com/windows/microsoft-edge">Edge</a>, ' +
    '<a href="https://mozilla.org/firefox">Firefox</a>, or <a href="https://google.com/chrome">Chrome</a>) ' +
    'to browse this site.';

  noticesDisplayed = false;

  constructor(
    private noticeService: NoticeService,
    private sessionService: SessionService,
    private $http: angular.IHttpService
  ) { }

  async displayNotices() {
    // Display them once per page load, not every time a new component is constructed
    if (this.noticesDisplayed) return;
    else this.noticesDisplayed = true;

    if (UtilityService.isIE(window.navigator.userAgent)) {
      this.noticeService.push(this.noticeService.ERROR, SiteWideNoticeService.ieMessage);
    }

    const site = (await this.sessionService.getSession()).baseSite();
    // using await instead of then seems to prevent the digest cycle from running
    this.$http.get('/site_wide_notices.json').then(notices => {
      for (const notice of notices.data as SiteWideNotice[]) {
        if (notice.site === site) this.noticeService.push(() => notice.type, notice.message);
      }
    });
  }
}

export const SiteWideNoticeModule = angular
  .module('siteWideNoticeModule', [NoticeModule])
  .service('siteWideNoticeService', SiteWideNoticeService)
  .name;
