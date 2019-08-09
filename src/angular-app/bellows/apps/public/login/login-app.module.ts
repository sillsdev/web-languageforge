import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';
import {LoginAppComponent} from './login-app.component';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    CoreModule
  ])
  .component('loginApp', LoginAppComponent)
  .name;
