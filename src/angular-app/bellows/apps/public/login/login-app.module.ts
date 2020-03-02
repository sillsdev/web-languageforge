import * as angular from 'angular';

import {SiteWideNoticeModule} from '../../../core/site-wide-notice-service';
import {CoreModule} from '../../../core/core.module';
import {LoginAppComponent} from './login-app.component';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    SiteWideNoticeModule,
    CoreModule
  ])
  .component('loginApp', LoginAppComponent)
  .name;
