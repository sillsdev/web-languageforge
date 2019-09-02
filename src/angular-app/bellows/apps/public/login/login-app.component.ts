import * as angular from 'angular';

import {BrowserCheckService} from '../../../core/browser-check.service';
import { NoticeService } from '../../../core/notice/notice.service';

export class LoginAppController implements angular.IController {
  static $inject = ['silNoticeService', 'browserCheckService'];
  constructor(private notice: NoticeService, private browserCheckService: BrowserCheckService) { }

  $onInit() {
    this.browserCheckService.warnIfIE();
    (document.querySelector('input[name="_username"]') as HTMLElement).focus();
  }
}

export const LoginAppComponent: angular.IComponentOptions = {
  controller: LoginAppController,
  templateUrl: '/angular-app/bellows/apps/public/login/login-app.component.html'
};
