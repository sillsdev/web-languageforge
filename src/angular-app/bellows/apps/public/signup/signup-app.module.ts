import * as angular from 'angular';

import { SignupAppComponent } from './signup-app.component';

export const ResetPasswordAppModule = angular
  .module('signup', ['ui.bootstrap', 'pascalprecht.translate', 'bellows.services',
    'palaso.util.model.transform', 'palaso.ui.captcha', 'zxcvbn'])
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
