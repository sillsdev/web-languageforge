import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {BreadcrumbModule} from '../../../bellows/core/breadcrumbs/breadcrumb.module';
import {SiteWideNoticeModule} from '../../../bellows/core/site-wide-notice-service';
import {CoreModule} from '../../../bellows/core/core.module';
import {MockModule} from '../../../bellows/shared/mock.module';
import {SelectLanguageModule} from '../../../bellows/shared/select-language.component';
import {PuiUtilityModule} from '../../../bellows/shared/utils/pui-utils.module';
import {LexiconCoreModule} from '../core/lexicon-core.module';
import {LexiconNewProjectComponent, NewProjectAbstractState} from './lexicon-new-project.component';
import {NewProjectChooserComponent, NewProjectChooserState} from './new-project-chooser.component';
import {
  NewProjectInitialDataComponent, NewProjectInitialDataState
} from './non-send-receive/new-project-initial-data.component';
import {NewProjectNameComponent, NewProjectNameState} from './non-send-receive/new-project-name.controller';
import {
  NewProjectSelectPrimaryLanguageComponent, NewProjectSelectPrimaryLanguageState
} from './non-send-receive/new-project-select-primary-language.component';
import {
  NewProjectVerifyDataComponent, NewProjectVerifyDataState
} from './non-send-receive/new-project-verify-data.component';
import {
  NewProjectSendReceiveCloneComponent, NewProjectSendReceiveCloneState
} from './send-receive/new-project-clone.component';
import {
  NewProjectSendReceiveCredentialsComponent, NewProjectSendReceiveCredentialsState
} from './send-receive/new-project-credentials.component';

export const LexiconNewProjectModule = angular
  .module('lexicon-new-project', [
    'ui.bootstrap',
    uiRouter,
    'ngFileUpload',
    CoreModule,
    SiteWideNoticeModule,
    BreadcrumbModule,
    PuiUtilityModule,
    SelectLanguageModule,
    MockModule,
    LexiconCoreModule
  ])
  .component('lexiconNewProject', LexiconNewProjectComponent)
  .component('newProjectChooser', NewProjectChooserComponent)
  .component('newProjectSendReceiveCredentials', NewProjectSendReceiveCredentialsComponent)
  .component('newProjectSendReceiveClone', NewProjectSendReceiveCloneComponent)
  .component('newProjectName', NewProjectNameComponent)
  .component('newProjectInitialData', NewProjectInitialDataComponent)
  .component('newProjectVerifyData', NewProjectVerifyDataComponent)
  .component('newProjectSelectPrimaryLanguage', NewProjectSelectPrimaryLanguageComponent)
  .config(['$stateProvider', '$urlRouterProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider) => {
      // State machine from ui.router
      $stateProvider
        .state(NewProjectAbstractState)
        .state(NewProjectChooserState)

        .state(NewProjectSendReceiveCredentialsState)
        .state(NewProjectSendReceiveCloneState)

        .state(NewProjectNameState)
        .state(NewProjectInitialDataState)
        .state(NewProjectVerifyDataState)
        .state(NewProjectSelectPrimaryLanguageState)
        ;

      $urlRouterProvider
        .when('', ['$state', ($state: angular.ui.IStateService | any) => {
          if (!$state.$current.navigable) {
            $state.go(NewProjectChooserState.name);
          }
        }]);

    }
  ])
  .name;
