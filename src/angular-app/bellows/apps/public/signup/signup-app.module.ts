import * as angular from 'angular';

import {SiteWideNoticeModule} from '../../../core/site-wide-notice-service';
import {CoreModule} from '../../../core/core.module';
import {CaptchaModule} from '../../../shared/captcha.component';
import {SignupAppComponent} from './signup-app.component';

export const ResetPasswordAppModule = angular
  .module('signup', [
    'ui.bootstrap',
    'zxcvbn',
    SiteWideNoticeModule,
    CoreModule,
    CaptchaModule
  ])
  .component('signupApp', SignupAppComponent)
  .name;
