'use strict';

// Declare app level module which depends on filters, and services
angular.module('usermanagement',
    [
      'ui.router',
     'usermanagement.members',
     'usermanagement.joinRequests',
     'palaso.ui.notice'
    ])
  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/members');

    $stateProvider.state('members',
          {
            url: '/members',
            views: {
              '@': { templateUrl: '/angular-app/bellows/apps/usermanagement/views/' + bootstrapVersion + '/members.html' }
            }
          })
          .state('joinRequests',
            {
              url: '/joinRequests',
              views: {
                '@': { templateUrl:
                  '/angular-app/bellows/apps/usermanagement/views/' + bootstrapVersion + '/joinRequests.html' }
              }
            });
  }])
  .controller('MainCtrl', ['$scope', 'projectService', 'silNoticeService', '$route', '$routeParams',
    '$location',
  function ($scope, projectService, noticeService, $route, $routeParams,
            $location) {
    $scope.roles = {};
    $scope.project = {};
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.isActive = function (route) {
      return route === $location.path();
    };

    $scope.list = {
      visibleUsers: [],
      users: []
    };

    $scope.queryUserList = function queryUserList() {
      projectService.listUsers(function (result) {
        if (result.ok) {
          $scope.list.users = result.data.users;
          $scope.list.userCount = result.data.userCount;
          $scope.project = result.data.project;
          $scope.roles = $scope.project.roles;
        }
      });
    };

    $scope.joinRequests = [];
    projectService.getJoinRequests(function (result) {
      $scope.joinRequests = result.data;
    });

  }])

  ;
