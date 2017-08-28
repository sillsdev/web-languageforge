'use strict';

// Declare app level module which depends on filters, and services
angular.module('translate',
  [
    'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'coreModule',
    'bellows.services',
    'pascalprecht.translate',
    'editorModule',
    'translate.settings',
    'translateCoreModule'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider',
    'apiServiceProvider',
    function ($stateProvider, $urlRouterProvider, $translateProvider, $compileProvider,
              apiService) {
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
  .controller('TranslateCtrl', ['$scope', '$state', 'sessionService', 'translateRightsService',
    '$q',
    function ($scope, $state, sessionService, rightsService, $q) {
      $q.all([sessionService.getSession(), rightsService.getRights()]).then(function (data) {
        var session = data[0];
        var rights = data[1];

        $scope.project = session.project();
        $scope.rights = rights;
        $scope.rights.showSettingsDropdown = function showSettingsDropdown() {
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

        $scope.gotoTranslation = function gotoTranslation() {
          $state.go('editor');
        };

        $scope.showTranslationButton = function showTranslationButton() {
          return !$state.is('editor');
        };

        $scope.onUpdateProject = function ($event) {
          $scope.project = $event.project;
        };
      });
    }])
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService',
    function ($scope, $rootScope, breadcrumbService) {
      $scope.idmap = breadcrumbService.idmap;
      $rootScope.$on('$routeChangeSuccess', function () {
        $scope.breadcrumbs = breadcrumbService.read();
      });

      $scope.$watch('idmap', function () {
        $scope.breadcrumbs = breadcrumbService.read();
      }, true);
    }])

  ;
