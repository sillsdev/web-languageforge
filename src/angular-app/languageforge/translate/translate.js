'use strict';

// Declare app level module which depends on filters, and services
angular.module('translate',
  [
    'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'bellows.services',
    'bellows.filters',
    'pascalprecht.translate',
    'translate.services',
    'translate.editor',
    'translate.settings'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
    function ($stateProvider, $urlRouterProvider, $translateProvider) {
      $urlRouterProvider.otherwise('/editor');

      // State machine from ui.router
      $stateProvider
        .state('settings', {
          url: '/settings',
          templateUrl: '/angular-app/languageforge/translate/views/settings.html'
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
  .controller('TranslateCtrl', ['$scope', '$location', 'sessionService',
    function ($scope, $location, sessionService) {
      $scope.project = sessionService.session.project;
      $scope.rights = {
        canEditUsers: function canEditUsers() {
          return sessionService.hasProjectRight(sessionService.domain.USERS,
            sessionService.operation.EDIT);
        }
      };

      // $scope.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
      $scope.interfaceConfig = {};
      $scope.interfaceConfig.direction = 'ltr';
      $scope.interfaceConfig.pullToSide = 'pull-right';
      $scope.interfaceConfig.pullNormal = 'pull-left';
      $scope.interfaceConfig.placementToSide = 'left';
      $scope.interfaceConfig.placementNormal = 'right';

      $scope.gotoTranslation = function gotoTranslation() {
        $location.path('/editor');
      };

      $scope.showTranslationButton = function showTranslationButton() {
        return !($location.path().indexOf('/editor') == 0);
      };

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
