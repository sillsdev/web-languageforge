import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    CoreModule
  ])
  .controller('LoginCtrl', () => {})
  .name;
