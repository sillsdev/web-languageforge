import * as angular from 'angular';

import { ChangePasswordAppComponent } from './change-password-app.component';

export const ChangePasswordModule = angular
  .module('changepassword', ['ui.bootstrap', 'bellows.services', 'ui.validate',
    'palaso.ui.notice', 'palaso.ui.utils', 'zxcvbn'
  ])
  .component('changePasswordApp', ChangePasswordAppComponent)
  .name;
