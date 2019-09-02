import * as angular from 'angular';

import {BrowserCheckModule} from '../../../core/browser-check.service';
import {CoreModule} from '../../../core/core.module';
import {CaptchaModule} from '../../../shared/captcha.component';
import {SignupAppComponent} from './signup-app.component';

export const ResetPasswordAppModule = angular
  .module('signup', [
    'ui.bootstrap',
    'zxcvbn',
    BrowserCheckModule,
    CoreModule,
    CaptchaModule
  ])
  .component('signupApp', SignupAppComponent)
  .name;
