import * as angular from 'angular';

import { UserService } from '../../../core/api/user.service';
import { BrowserCheckModule, BrowserCheckService } from '../../../core/browser-check.service';
import { CoreModule } from '../../../core/core.module';
import { UserWithPassword } from '../../../shared/model/user-password.model';

export class ResetPasswordController implements angular.IController {
  record: UserWithPassword;
  confirmPassword: string;
  submissionInProgress: boolean = false;

  private forgotPasswordKey: string;

  static $inject = ['$location', '$window', 'browserCheckService', 'userService'];
  constructor(private $location: angular.ILocationService, private $window: angular.IWindowService,
              private browserCheckService: BrowserCheckService,
              private userService: UserService) {}

  $onInit() {
    const absUrl = this.$location.absUrl();
    const appName = '/reset_password/';
    this.browserCheckService.warnIfIE();
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
  .module('reset_password', ['ui.bootstrap', CoreModule, BrowserCheckModule])
  .controller('ResetPasswordCtrl', ResetPasswordController)
  .name;
