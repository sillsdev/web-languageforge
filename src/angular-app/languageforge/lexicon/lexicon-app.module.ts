import * as angular from 'angular';
import 'angular-sanitize';
import uiRouter from 'angular-ui-router';
import './new-project/lexicon-new-project.module';

import {ApiService} from '../../bellows/core/api/api.service';
import {SiteWideNoticeModule} from '../../bellows/core/site-wide-notice-service';
import {CoreModule} from '../../bellows/core/core.module';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorModule} from './editor/editor.module';
import {LexiconAppComponent} from './lexicon-app.component';
import {LexiconSettingsModule} from './settings/settings.module';
import { ShareWithOthersModule } from './shared/share-with-others/share-with-others.module';

export const LexiconAppModule = angular
  .module('lexicon', [
    'ui.bootstrap',
    uiRouter,
    'ngSanitize',
    CoreModule,
    SiteWideNoticeModule,
    LexiconCoreModule,
    LexiconEditorModule,
    LexiconSettingsModule,
    ShareWithOthersModule
  ])
  .component('lexiconApp', LexiconAppComponent)
  .config(['$stateProvider', '$urlRouterProvider',
    '$compileProvider', '$sanitizeProvider', 'apiServiceProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider,
     $compileProvider: angular.ICompileProvider, $sanitizeProvider: any, apiService: ApiService) => {

      $compileProvider.debugInfoEnabled(apiService.isProduction);
      $compileProvider.commentDirectivesEnabled(apiService.isProduction);

      // this is needed to allow style="font-family" on ng-bind-html elements
      $sanitizeProvider.addValidAttrs(['style']);

      $urlRouterProvider.otherwise('/editor/list?sortBy=Default&sortReverse=false&filterType=isNotEmpty&filterBy=null');

      // State machine from ui.router
      $stateProvider
        .state('configuration', {
          url: '/configuration',
          template: `<lexicon-config lsc-config="$ctrl.config"
                                     lsc-option-lists="$ctrl.optionLists"
                                     lsc-users="$ctrl.users"
                                     lsc-on-update="$ctrl.onUpdate($event)"></lexicon-config>`
        })
        .state('importExport', {
          url: '/importExport',
          template: `<lexicon-import></lexicon-import>`
        })
        .state('settings', {
          url: '/settings',
          template: `<lexicon-project-settings lps-project="$ctrl.project"
                                               lps-rights="$ctrl.rights"
                                               lps-interface-config="$ctrl.interfaceConfig"
                                               lps-on-update="$ctrl.onUpdate($event)"></lexicon-project-settings>`
        })
        .state('sync', {
          url: '/sync',
          template: `<lexicon-sync lsy-rights="$ctrl.rights"></lexicon-sync>`
        })
      ;

    }
  ])
  .name;
