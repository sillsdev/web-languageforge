import * as angular from 'angular';
import uiRouter from 'angular-ui-router';
import { ApiService } from '../../bellows/core/api/api.service';
import { SessionService } from '../../bellows/core/session.service';
import { TranslateRightsService } from './core/translate-rights.service';
import { CoreModule } from '../../bellows/core/core.module';
import { EditorModule } from './editor/editor.module';
import { TranslateSettingsModule } from './settings/settings.module';
import { TranslateCoreModule } from './core/translate-core.module';
import './new-project/translate-new-project.module';

export const TranslateModule = angular
  .module('translate', [
    uiRouter,
    'ui.bootstrap',
    'ngSanitize',
    'bellows.services',
    'pascalprecht.translate',
    CoreModule,
    TranslateCoreModule,
    EditorModule,
    TranslateSettingsModule
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider', 'apiServiceProvider',
    function ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider,
              $translateProvider: angular.translate.ITranslateProvider, $compileProvider: angular.ICompileProvider,
              apiService: ApiService) {
      $compileProvider.debugInfoEnabled(apiService.isProduction);
      $compileProvider.commentDirectivesEnabled(apiService.isProduction);

      $urlRouterProvider.otherwise('/editor');

      // State machine from ui.router
      $stateProvider
        .state('settings', {
          url: '/settings',
          template: '<translate-settings tsc-on-update="onUpdateProject($event)">' +
            '</translate-settings>'
        })
        .state('editor', {
          url: '/editor',
          template: '<editor-component ec-project="project" ec-on-update="onUpdateProject($event)"' +
            'ec-interface-config="interfaceConfig"></editor-component>'
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
  .controller('TranslateCtrl', ['$scope', '$state', 'sessionService', 'translateRightsService', '$q',
    function ($scope: any, $state: angular.ui.IStateService, sessionService: SessionService,
              rightsService: TranslateRightsService, $q: angular.IQService) {
      $q.all([sessionService.getSession(), rightsService.getRights()]).then(function (data) {
        let session = data[0];
        let rights = data[1];

        $scope.project = session.project();
        $scope.rights = rights;
        $scope.rights.showSettingsDropdown = () => {
          return $scope.rights.canEditProject() || $scope.rights.canEditUsers() ||
            $scope.rights.canEditEntry();
        };

        // $scope.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
        $scope.interfaceConfig = {};
        $scope.interfaceConfig.direction = 'ltr';
        $scope.interfaceConfig.pullToSide = 'pull-right';
        $scope.interfaceConfig.pullNormal = 'pull-left';
        $scope.interfaceConfig.placementToSide = 'left';
        $scope.interfaceConfig.placementNormal = 'right';

        // setup offline.js options
        // see https://github.com/hubspot/offline for all options
        // we tell offline.js to NOT store and remake requests while the connection is down
        Offline.options.requests = false;
        Offline.options.checkOnLoad = true;
        Offline.options.checks = { xhr: { url: '/offlineCheck.txt' } };

        $scope.gotoTranslation = () => {
          $state.go('editor');
        };

        $scope.showTranslationButton = () => {
          return !$state.is('editor');
        };

        $scope.onUpdateProject = ($event: { project: any }) => {
          $scope.project = $event.project;
        };
      });
    }])
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService',
    function ($scope: any, $rootScope: angular.IRootScopeService, breadcrumbService: any) {
      $scope.idmap = breadcrumbService.idmap;
      $rootScope.$on('$routeChangeSuccess', () => {
        $scope.breadcrumbs = breadcrumbService.read();
      });

      $scope.$watch('idmap', () => {
        $scope.breadcrumbs = breadcrumbService.read();
      }, true);
    }])

  ;
