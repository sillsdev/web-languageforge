import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import { ApiService } from '../../core/api/api.service';
import { SiteWideNoticeModule } from '../../core/site-wide-notice-service';
import { CoreModule } from '../../core/core.module';
import { TranslateCoreModule } from './core/translate-core.module';
import { TranslateEditorModule } from './editor/editor.module';
import './new-project/translate-new-project.module';
import { TranslateSettingsModule } from './settings/settings.module';
import { TranslateAppComponent } from './translate-app.component';

export const TranslateAppModule = angular
  .module('translate', [
    uiRouter,
    'ui.bootstrap',
    'ngSanitize',
    SiteWideNoticeModule,
    CoreModule,
    TranslateCoreModule,
    TranslateEditorModule,
    TranslateSettingsModule
  ])
  .component('translateApp', TranslateAppComponent)
  .config(['$stateProvider', '$urlRouterProvider',
    '$compileProvider', 'apiServiceProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider,
     $compileProvider: angular.ICompileProvider, apiService: ApiService) => {

      $compileProvider.debugInfoEnabled(apiService.isProduction);
      $compileProvider.commentDirectivesEnabled(apiService.isProduction);

      $urlRouterProvider.otherwise('/editor');

      // State machine from ui.router
      $stateProvider
        .state('settings', {
          url: '/settings',
          template: '<translate-settings tsc-rights="$ctrl.rights" tsc-project="$ctrl.project" ' +
            'tsc-interface-config="$ctrl.interfaceConfig" ' +
            'tsc-on-update="$ctrl.onUpdateProject($event)"></translate-settings>'
        })
        .state('editor', {
          url: '/editor',
          template: '<translate-editor class="d-flex flex-column flex-grow" tec-project="$ctrl.project" ' +
            'tec-rights="$ctrl.rights" tec-on-update="$ctrl.onUpdateProject($event)" ' +
            'tec-interface-config="$ctrl.interfaceConfig"></translate-editor>'
        })
        .state('sync', {
          url: '/sync',
          template: '<translate-sync tsyc-project="$ctrl.project" tsyc-rights="$ctrl.rights" ' +
            'tsyc-on-update="$ctrl.onUpdateProject($event)"></translate-sync>'
        })
        ;

    }])
  .name;
