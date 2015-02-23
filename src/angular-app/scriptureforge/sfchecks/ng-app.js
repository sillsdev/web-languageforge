'use strict';

// Declare app level module which depends on filters, and services
angular.module('sfchecks', 
    [
     'ngRoute',
     'ngSanitize',
     'sfchecks.project',
     'sfchecks.projectSettings',
     'sfchecks.questions',
     'sfchecks.question',
     'sfchecks.filters',
     'bellows.filters',
     'palaso.ui.notice',
     'sf.ui.invitefriend',
     'wc.Directives'
    ])
  .config(['$routeProvider', function($routeProvider) {
    // the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
      $routeProvider.when('/projects', { template: ' ', controller: function() { window.location.replace('/app/projects'); } }
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
          templateUrl: '/angular-app/scriptureforge/sfchecks/partials/questions.html', 
          controller: 'QuestionsCtrl'
        }
      );
      $routeProvider.when(
          '/:textId/settings', 
          {
            templateUrl: '/angular-app/scriptureforge/sfchecks/partials/questions-settings.html', 
            controller: 'QuestionsSettingsCtrl'
          }
        );
      $routeProvider.when(
        '/:textId/:questionId',
        {
          templateUrl: '/angular-app/scriptureforge/sfchecks/partials/question.html', 
          controller: 'QuestionCtrl'
      }
    );
      $routeProvider.otherwise({redirectTo: '/projects'});
  }])
  .controller('MainCtrl', ['$scope', 'silNoticeService', '$route', '$routeParams', '$location',
                           function($scope, noticeService, $route, $routeParams, $location) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
  }])
  ;
