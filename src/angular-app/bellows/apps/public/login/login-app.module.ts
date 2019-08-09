import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';
import {LoginAppComponent} from './login-app.component';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    CoreModule
  ])
  .value('loginPath', "pasta")
  .value('last_username', '{{ last_username }}')
  // .controller('LoginCtrl', () => {})
  .component('loginApp', LoginAppComponent)
  .name;
