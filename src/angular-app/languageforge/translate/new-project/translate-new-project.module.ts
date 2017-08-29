import * as angular from 'angular';
import uiRouter from 'angular-ui-router';
import { CoreModule } from '../../../bellows/core/core.module'
import { TranslateCoreModule } from '../core/translate-core.module';
import { TranslateSharedModule } from '../shared/translate-shared.module';
import { TranslateNewProjectController } from './translate-new-project.controller';

angular.module('translate-new-project', [
    CoreModule,
    'bellows.services',
    'ui.bootstrap',
    uiRouter,
    'palaso.ui.utils',
    'palaso.ui.sendReceiveCredentials',
    'palaso.ui.mockUpload',
    'palaso.util.model.transform',
    'pascalprecht.translate',
    'ngFileUpload',
    'language.inputSystems',
    TranslateCoreModule,
    TranslateSharedModule
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function ($stateProvider: angular.ui.IStateProvider,
            $urlRouterProvider: angular.ui.IUrlRouterProvider,
            $translateProvider: angular.translate.ITranslateProvider) {

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
    ;

    $urlRouterProvider
      .when('', ['$state', ($state: angular.ui.IStateService | any) => {
        if (!$state.$current.navigable) {
          $state.go('newProject.name');
        }
      }]);

  }])
  .controller('NewTranslateProjectCtrl', TranslateNewProjectController)

  ;
