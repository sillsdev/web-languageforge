import * as angular from 'angular';

import { CoreModule } from '../../../core/core.module';
import { OAuthSignupAppComponent } from './oauth-signup-app.component';

export const OAuthSignupAppModule = angular
    .module('oauth-signup', ['ui.bootstrap', CoreModule])
    .component('oauthSignupApp', OAuthSignupAppComponent)
    .name;
