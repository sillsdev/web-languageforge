import * as angular from 'angular';

import {SiteWideNoticeService} from '../../../core/site-wide-notice-service';
import { NoticeService } from '../../../core/notice/notice.service';

export class LoginAppController implements angular.IController {
  static $inject = ['silNoticeService', 'siteWideNoticeService'];
  constructor(private notice: NoticeService, private siteWideNoticeService: SiteWideNoticeService) { }

  $onInit() {
    this.siteWideNoticeService.displayNotices();
    (document.querySelector('input[name="_username"]') as HTMLElement).focus();
  }
}

export const LoginAppComponent: angular.IComponentOptions = {
  controller: LoginAppController,
  templateUrl: '/angular-app/bellows/apps/public/login/login-app.component.html'
};
