'use strict';

// Declare app level module which depends on filters, and services
angular.module('usermanagement',
    [
     'ngRoute',
     'usermanagement.members',
     'palaso.ui.notice'
    ])
  .config(['$routeProvider', function($routeProvider) {
    // the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
      $routeProvider.when(
        '/members',
        {
          templateUrl: '/angular-app/bellows/apps/usermanagement/views/members.html',
          controller: 'MembersCtrl'
        }
      );
      $routeProvider.otherwise({redirectTo: '/members'});
  }])
  .controller('MainCtrl', ['$scope', 'silNoticeService', '$route', '$routeParams', '$location',
                           function($scope, noticeService, $route, $routeParams, $location) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
  }])
  ;
