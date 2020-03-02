import * as angular from 'angular';

import { SiteWideNoticeModule } from '../../../core/site-wide-notice-service';
import { CoreModule } from '../../../core/core.module';
import { OAuthSignupAppComponent } from './oauth-signup-app.component';

export const OAuthSignupAppModule = angular
    .module('oauth-signup', ['ui.bootstrap', CoreModule, SiteWideNoticeModule])
    .component('oauthSignupApp', OAuthSignupAppComponent)
    .name;
