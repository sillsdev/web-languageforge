import * as angular from 'angular';

import { NoticeService } from '../../../core/notice/notice.service';

export class LoginAppController implements angular.IController {
  static $inject = ['silNoticeService', 'loginPath'];
  constructor(private notice: NoticeService, private loginPath: any) { }

  $onInit() {
    this.notice.checkUrlForNotices();
  }
}

export const LoginAppComponent: angular.IComponentOptions = {
  controller: LoginAppController,
  templateUrl: '/angular-app/bellows/apps/public/login/login-app.component.html'
};
