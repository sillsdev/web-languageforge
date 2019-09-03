import * as angular from 'angular';

import {BrowserCheckModule} from '../../../core/browser-check.service';
import {CoreModule} from '../../../core/core.module';
import {LoginAppComponent} from './login-app.component';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    BrowserCheckModule,
    CoreModule
  ])
  .component('loginApp', LoginAppComponent)
  .name;
