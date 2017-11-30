import * as angular from 'angular';

import { CoreModule } from '../../../core/core.module';
import { OAuthSignupAppComponent } from './oauth-signup-app.component';

export const OAuthSignupAppModule = angular
    .module('oauth-signup', ['ui.bootstrap', CoreModule])
    .component('oauthSignupApp', OAuthSignupAppComponent)
    // .controller('OAuthSignupAppController', () => {})
    .name;


/*
import * as angular from 'angular';

import { CoreModule } from '../../../core/core.module';
import { SignupAppComponent } from './signup-app.component';

export const ResetPasswordAppModule = angular
  .module('signup', ['ui.bootstrap', 'pascalprecht.translate', 'zxcvbn',
    CoreModule, 'palaso.util.model.transform', 'palaso.ui.captcha'
  ])
  .component('signupApp', SignupAppComponent)
  .config(['$translateProvider', function ($translateProvider: angular.translate.ITranslateProvider) {
    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/bellows/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
  }])
  .name;
 */
