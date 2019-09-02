import * as angular from 'angular';

import { BrowserCheckModule } from '../../../core/browser-check.service';
import { CoreModule } from '../../../core/core.module';
import { OAuthSignupAppComponent } from './oauth-signup-app.component';

export const OAuthSignupAppModule = angular
    .module('oauth-signup', ['ui.bootstrap', CoreModule, BrowserCheckModule])
    .component('oauthSignupApp', OAuthSignupAppComponent)
    .name;
