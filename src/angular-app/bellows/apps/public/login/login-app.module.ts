import * as angular from 'angular';

import {SiteWideNoticeModule} from '../../../core/site-wide-notice-service';
import {CoreModule} from '../../../core/core.module';

export const LoginAppModule = angular
  .module('login', [
    'ui.bootstrap',
    SiteWideNoticeModule,
    CoreModule
  ])
  .controller('LoginCtrl', () => {})
  .name;
