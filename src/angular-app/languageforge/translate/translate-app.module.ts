import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import { ApiService } from '../../bellows/core/api/api.service';
import { CoreModule } from '../../bellows/core/core.module';
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
    'pascalprecht.translate',
    CoreModule,
    TranslateCoreModule,
    TranslateEditorModule,
    TranslateSettingsModule
  ])
  .component('translateApp', TranslateAppComponent)
  .config(['$stateProvider', '$urlRouterProvider',
    '$translateProvider', '$compileProvider',
    'apiServiceProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider,
     $translateProvider: angular.translate.ITranslateProvider, $compileProvider: angular.ICompileProvider,
     apiService: ApiService) => {
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
          template: '<translate-editor tec-project="$ctrl.project" ' +
            'tec-on-update="$ctrl.onUpdateProject($event)" ' +
            'tec-interface-config="$ctrl.interfaceConfig"></translate-editor>'
        })
        ;

      // configure interface language file path
      $translateProvider.useStaticFilesLoader({
        prefix: '/angular-app/languageforge/lexicon/lang/',
        suffix: '.json'
      });
      $translateProvider.preferredLanguage('en');
      $translateProvider.useSanitizeValueStrategy('escape');
    }])
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService',
    ($scope: any, $rootScope: angular.IRootScopeService, breadcrumbService: any) => {
      $scope.idmap = breadcrumbService.idmap;
      $rootScope.$on('$routeChangeSuccess', () => {
        $scope.breadcrumbs = breadcrumbService.read();
      });

      $scope.$watch('idmap', () => {
        $scope.breadcrumbs = breadcrumbService.read();
      }, true);
    }])
  .name;
