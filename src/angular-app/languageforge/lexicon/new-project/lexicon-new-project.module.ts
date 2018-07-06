import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../../bellows/core/core.module';
import {MockModule} from '../../../bellows/shared/mock.module';
import {SelectLanguageModule} from '../../../bellows/shared/select-language.component';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';
import {LexiconCoreModule} from '../core/lexicon-core.module';
import {
  LexiconNewProjectAbstractState,
  LexiconNewProjectChooserState, LexiconNewProjectInitialDataState,
  LexiconNewProjectNameState, LexiconNewProjectSelectPrimaryLanguageState, LexiconNewProjectSendReceiveCloneState,
  LexiconNewProjectSendReceiveCredentialsState, LexiconNewProjectVerifyDataState
} from './lexicon-new-project-state.model';
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
        .state(LexiconNewProjectAbstractState)
        .state(LexiconNewProjectChooserState)
        .state(LexiconNewProjectNameState)
        .state(LexiconNewProjectSendReceiveCredentialsState)
        .state(LexiconNewProjectInitialDataState)
        .state(LexiconNewProjectSendReceiveCloneState)
        .state(LexiconNewProjectVerifyDataState)
        .state(LexiconNewProjectSelectPrimaryLanguageState)
        ;

      $urlRouterProvider
        .when('', ['$state', ($state: angular.ui.IStateService | any) => {
          if (!$state.$current.navigable) {
            $state.go(LexiconNewProjectChooserState.name);
          }
        }]);

    }
  ])
  .name;
