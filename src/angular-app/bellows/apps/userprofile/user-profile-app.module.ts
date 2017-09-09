import * as angular from 'angular';

import { UserProfileAppComponent } from './user-profile-app.component';

export const UserProfileAppModule = angular
  .module('userprofile', ['ui.bootstrap', 'coreModule', 'bellows.services',
    'pascalprecht.translate', 'palaso.ui.intlTelInput', 'palaso.ui.notice'
  ])
  .component('userProfileApp', UserProfileAppComponent)
  .config(['$translateProvider', ($translateProvider: angular.translate.ITranslateProvider) => {
    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/bellows/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
  }])
  .name;
