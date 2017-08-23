import * as angular from 'angular';

import { TranslateNewProjectController } from './translate-new-project.controller';

angular.module('translate-new-project', [
    'coreModule',
    'bellows.services',
    'ui.bootstrap',
    'ui.router',
    'palaso.ui.utils',
    'palaso.ui.sendReceiveCredentials',
    'palaso.ui.mockUpload',
    'palaso.util.model.transform',
    'pascalprecht.translate',
    'ngFileUpload',
    'language.inputSystems',
    'translateCoreModule',
    'translateSharedModule'
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
      .state('newProject', <angular.ui.IState>{
        abstract: true,
        templateUrl:
          '/angular-app/languageforge/translate/new-project/views/new-project-abstract.html',
        controller: 'NewTranslateProjectCtrl',
        controllerAs: '$ctrl'
      })
      .state('newProject.name', <angular.ui.IState>{
        templateUrl: '/angular-app/languageforge/translate/new-project/views/new-project-name.html',
        data: {
          step: 1
        }
      })
      .state('newProject.languages', <angular.ui.IState>{
        templateUrl:
          '/angular-app/languageforge/translate/new-project/views/new-project-languages.html',
        data: {
          step: 2
        }
      })
    ;

    $urlRouterProvider
      .when('', ['$state', function ($state: angular.ui.IStateService | any) {
        if (!$state.$current.navigable) {
          $state.go('newProject.name');
        }
      }]);

  }])
  .controller('NewTranslateProjectCtrl', TranslateNewProjectController)

  ;
