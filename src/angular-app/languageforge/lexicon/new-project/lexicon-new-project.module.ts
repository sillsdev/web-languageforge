import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {MockModule} from '../../../bellows/shared/mock.module';
import {SelectLanguageModule} from '../../../bellows/shared/select-language.component';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';
import {LexiconCoreModule} from '../core/lexicon-core.module';
import {LexiconNewProjectController} from './lexicon-new-project.controller';
import {SendReceiveCredentialsComponent} from './send-receive-credentials.component';

export const LexiconNewProjectModule = angular
  .module('lexicon-new-project', [
    'ui.bootstrap',
    uiRouter,
    'ngFileUpload',
    CoreModule,
    BreadcrumbModule,
    PuiUtilityModule,
    SelectLanguageModule,
    MockModule,
    LexiconCoreModule
  ])
  .component('sendReceiveCredentials', SendReceiveCredentialsComponent)
  .controller('NewLexiconProjectCtrl', LexiconNewProjectController)
  .config(['$stateProvider', '$urlRouterProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
      // State machine from ui.router
      $stateProvider
        .state('newProject', {
          abstract: true,
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-abstract.html',
          controller: 'NewLexiconProjectCtrl',
          controllerAs: '$ctrl'
        })
        .state('newProject.chooser', {
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-chooser.html',
          data: {
            step: 0
          }
        })
        .state('newProject.name', {
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-name.html',
          data: {
            step: 1
          }
        })
        .state('newProject.sendReceiveCredentials', {
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-credentials.html',
          data: {
            step: 1
          }
        })
        .state('newProject.initialData', {
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-initial-data.html',
          data: {
            step: 2
          }
        })
        .state('newProject.sendReceiveClone', {
          templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-clone.html',
          data: {
            step: 2
          }
        })
      .state('newProject.verifyData', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-verify-data.html',
        data: {
          step: 3
        }
      })
      .state('newProject.selectPrimaryLanguage', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-select-primary-language.html',
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

    }
  ])
  .name;
