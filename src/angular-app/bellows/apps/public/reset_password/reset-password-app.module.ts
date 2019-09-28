import * as angular from 'angular';

import { UserService } from '../../../core/api/user.service';
import { SiteWideNoticeModule, SiteWideNoticeService } from '../../../core/site-wide-notice-service';
import { CoreModule } from '../../../core/core.module';
import { UserWithPassword } from '../../../shared/model/user-password.model';

export class ResetPasswordController implements angular.IController {
  record: UserWithPassword;
  confirmPassword: string;
  submissionInProgress: boolean = false;

  private forgotPasswordKey: string;

  static $inject = ['$location', '$window', 'siteWideNoticeService', 'userService'];
  constructor(private $location: angular.ILocationService, private $window: angular.IWindowService,
              private siteWideNoticeService: SiteWideNoticeService,
              private userService: UserService) {}

  $onInit() {
    const absUrl = this.$location.absUrl();
    const appName = '/reset_password/';
    this.siteWideNoticeService.displayNotices();
    this.forgotPasswordKey = absUrl.substring(absUrl.indexOf(appName) + appName.length);
  }

  resetPassword(): void {
    if (this.record.password == this.confirmPassword && this.forgotPasswordKey) {
      this.submissionInProgress = true;
      this.userService.resetPassword(this.forgotPasswordKey, this.record.password, (result) => {
        if (result.ok) {
          this.$window.location.href = '/auth/login';
        }
        else this.submissionInProgress = false;
      });
    }
  }

}

export const ResetPasswordAppModule = angular
  .module('reset_password', ['ui.bootstrap', CoreModule, SiteWideNoticeModule])
  .controller('ResetPasswordCtrl', ResetPasswordController)
  .name;
