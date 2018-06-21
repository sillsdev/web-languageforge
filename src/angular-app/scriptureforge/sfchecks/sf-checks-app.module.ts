import * as angular from 'angular';

import {CoreModule} from '../../bellows/core/core.module';
import {NoticeModule} from '../../bellows/core/notice/notice.module';
import {SfChecksCoreModule} from './core/sf-checks-core.module';
import {SfChecksQuestionModule} from './text/question.controller';
import {SfChecksTextModule} from './text/text.controller';

export const SfChecksAppModule = angular
  .module('sfchecks', [
    'ui.bootstrap',
    'ngRoute',
    'ngSanitize',
    CoreModule,
    NoticeModule,
    SfChecksCoreModule,
    'sfchecks.project',
    'sfchecks.projectSettings',
    SfChecksTextModule,
    SfChecksQuestionModule,
    'sf.ui.invitefriend'
  ])
  .config(['$routeProvider', ($routeProvider: angular.route.IRouteProvider) => {
    $routeProvider
      .when('/', {
        templateUrl: '/angular-app/scriptureforge/sfchecks/partials/project.html',
        controller: 'ProjectCtrl'
      })
      .when('/settings', {
        templateUrl: '/angular-app/scriptureforge/sfchecks/partials/projectSettings.html',
        controller: 'ProjectSettingsCtrl'
      })
      .when('/:textId', {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/text.html',
        controller: 'TextCtrl'
      })
      .when('/:textId/settings', {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/text-settings.html',
        controller: 'TextSettingsCtrl'
      })
      .when('/:textId/:questionId', {
        templateUrl: '/angular-app/scriptureforge/sfchecks/text/question.html',
        controller: 'QuestionCtrl'
      })
      // the "projects" route is a hack to redirect to the /app/projects URL. See "otherwise" route below
      .when('/projects', {
        template: ' ',
        controller: () => { window.location.replace('/app/projects'); }
      })
      .otherwise({ redirectTo: '/projects' });
  }])
  .controller('SfChecksAppCtrl', ['$scope', '$route', '$routeParams', '$location',
  ($scope, $route, $routeParams, $location) => {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
  }])
  .name;
