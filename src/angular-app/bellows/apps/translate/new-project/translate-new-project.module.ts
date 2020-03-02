import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {SiteWideNoticeModule} from '../../../core/site-wide-notice-service';
import {CoreModule} from '../../../core/core.module';
import {InputSystemsModule} from '../../../core/input-systems/input-systems.service';
import {PuiUtilityModule} from '../../../shared/utils/pui-utils.module';
import {TranslateCoreModule} from '../core/translate-core.module';
import {TranslateSharedModule} from '../shared/translate-shared.module';
import {TranslateNewProjectController} from './translate-new-project.controller';

export const TranslateNewProjectModule = angular.module('translate-new-project', [
    'ui.bootstrap',
    uiRouter,
    'ngFileUpload',
    CoreModule,
    SiteWideNoticeModule,
    PuiUtilityModule,
    InputSystemsModule,
    TranslateCoreModule,
    TranslateSharedModule
  ])
  .controller('NewTranslateProjectCtrl', TranslateNewProjectController)
  .config(['$stateProvider', '$urlRouterProvider',
  ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {

    // State machine from ui.router
    $stateProvider
      .state('newProject', {
        abstract: true,
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-abstract.html',
        controller: 'NewTranslateProjectCtrl',
        controllerAs: '$ctrl'
      })
      .state('newProject.chooser', {
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-chooser.html',
        data: {
          step: 0
        }
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-name.html',
        data: {
          step: 1
        }
      })
      .state('newProject.languages', {
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-languages.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveCredentials', {
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-sr-credentials.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveClone', {
        templateUrl: '/angular-app/bellows/apps/translate/new-project/views/new-project-sr-clone.html',
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
