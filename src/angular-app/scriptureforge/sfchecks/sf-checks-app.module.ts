import * as angular from 'angular';

import {CoreModule} from '../../bellows/core/core.module';
import {SfChecksCoreModule} from './core/sf-checks-core.module';

export const SfChecksAppModule = angular
  .module('sfchecks', [
    'ui.bootstrap',
    'ngRoute',
    'ngSanitize',
    CoreModule,
    SfChecksCoreModule,
    'sfchecks.project',
    'sfchecks.projectSettings',
    'sfchecks.questions',
    'sfchecks.question',
    'palaso.ui.notice',
    'sf.ui.invitefriend'
  ])
  .config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider) => {
    // the "projects" route is a hack to redirect to the /app/projects URL.
    // See "otherwise" route below
    $routeProvider.when('/projects', { template: ' ',
      controller: () => { window.location.replace('/app/projects'); }
      }
    );
    $routeProvider.when(
      '/',
      {
        templateUrl: '/angular-app/scriptureforge/sfchecks/partials/project.html',
        controller: 'ProjectCtrl'
      }
    );
    $routeProvider.when(
      '/settings',
      {
        templateUrl: '/angular-app/scriptureforge/sfchecks/partials/projectSettings.html',
        controller: 'ProjectSettingsCtrl'
      }
    );
    $routeProvider.when(
      '/:textId',
      {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/text.html',
        controller: 'QuestionsCtrl'
      }
    );
    $routeProvider.when(
      '/:textId/settings',
      {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/text-settings.html',
        controller: 'QuestionsSettingsCtrl'
      }
    );
    $routeProvider.when(
      '/:textId/:questionId',
      {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/question.html',
        controller: 'QuestionCtrl'
      }
    );
    $routeProvider.otherwise({ redirectTo: '/projects' });
  }])
  .controller('MainCtrl', ['$scope', '$route', '$routeParams', '$location',
  ($scope, $route, $routeParams, $location) => {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
  }])
  .name;
