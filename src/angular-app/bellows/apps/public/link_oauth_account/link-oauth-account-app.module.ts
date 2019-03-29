import * as angular from 'angular';

import {CoreModule} from '../../../core/core.module';

export const LinkOAuthAccountAppModule = angular
  .module('link_oauth_account', [
    'ui.bootstrap',
    CoreModule
  ])
  .name;
