import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import { CoreModule } from '../../../bellows/core/core.module';
import { InputSystemsModule } from '../../../bellows/core/input-systems/input-systems.service';
import { PuiUtilityModule } from '../../../bellows/shared/pui-utils.module';
import { TranslateCoreModule } from '../core/translate-core.module';
import { TranslateSharedModule } from '../shared/translate-shared.module';
import { TranslateNewProjectController } from './translate-new-project.controller';

export const TranslateNewProjectModule = angular.module('translate-new-project', [
    'ui.bootstrap',
    uiRouter,
    'pascalprecht.translate',
    'ngFileUpload',
    CoreModule,
    PuiUtilityModule,
    InputSystemsModule,
    TranslateCoreModule,
    TranslateSharedModule
  ])
  .controller('NewTranslateProjectCtrl', TranslateNewProjectController)
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  ($stateProvider: angular.ui.IStateProvider,
   $urlRouterProvider: angular.ui.IUrlRouterProvider,
   $translateProvider: angular.translate.ITranslateProvider) => {

    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/translate/new-project/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');

    // State machine from ui.router
    $stateProvider
      .state('newProject', {
        abstract: true,
        templateUrl:
          '/angular-app/languageforge/translate/new-project/views/new-project-abstract.html',
        controller: 'NewTranslateProjectCtrl',
        controllerAs: '$ctrl'
      })
      .state('newProject.chooser', {
        templateUrl: '/angular-app/languageforge/translate/new-project/views/new-project-chooser.html',
        data: {
          step: 0
        }
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/languageforge/translate/new-project/views/new-project-name.html',
        data: {
          step: 1
        }
      })
      .state('newProject.languages', {
        templateUrl:
          '/angular-app/languageforge/translate/new-project/views/new-project-languages.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveCredentials', {
        templateUrl: '/angular-app/languageforge/translate/new-project/views/new-project-sr-credentials.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveClone', {
        templateUrl:
          '/angular-app/languageforge/translate/new-project/views/new-project-sr-clone.html',
        data: {
          step: 3
        }
      })
    ;

    $urlRouterProvider
      .when('', ['$state', ($state: angular.ui.IStateService | any) => {
        if (!$state.$current.navigable) {
          $state.go('newProject.chooser');
        }
      }]);

  }])
  .name;
