import * as angular from 'angular';

import { ChangePasswordComponent } from './change-password.component';

export const ChangePasswordModule = angular
  .module('changepassword', ['ui.bootstrap', 'bellows.services', 'ui.validate',
    'palaso.ui.notice', 'palaso.ui.utils', 'zxcvbn'
  ])
  .component('changePassword', ChangePasswordComponent)
  .name;
