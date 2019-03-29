import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';

export const ForgotPasswordAppModule = angular
  .module('forgot_password', [
    'ui.bootstrap',
    CoreModule
  ])
  .controller('ForgotPasswordCtrl', () => {})
  .name;
