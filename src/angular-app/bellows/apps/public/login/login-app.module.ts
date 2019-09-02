import * as angular from 'angular';

import {BrowserCheckModule} from '../../../core/browser-check.service';
import {CoreModule} from '../../../core/core.module';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    BrowserCheckModule,
    CoreModule
  ])
  .controller('LoginCtrl', () => {})
  .name;
