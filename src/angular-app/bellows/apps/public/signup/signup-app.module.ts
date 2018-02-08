import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';
import {SignupAppComponent} from './signup-app.component';

export const ResetPasswordAppModule = angular
  .module('signup', ['ui.bootstrap', 'zxcvbn', CoreModule, 'palaso.util.model.transform', 'palaso.ui.captcha'])
  .component('signupApp', SignupAppComponent)
  .name;
