import * as angular from 'angular';

import { NoticeService } from '../../../core/notice/notice.service';

export class LoginAppController implements angular.IController {
  static $inject = ['silNoticeService'];
  constructor(private notice: NoticeService) { }

  $onInit() {
    (document.querySelector('input[name="_username"]') as HTMLElement).focus();
  }
}

export const LoginAppComponent: angular.IComponentOptions = {
  controller: LoginAppController,
  templateUrl: '/angular-app/bellows/apps/public/login/login-app.component.html'
};
