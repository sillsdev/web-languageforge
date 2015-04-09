'use strict';

// Declare app level module which depends on filters, and services
angular.module('usermanagement',
    [
      'ui.router',
     'usermanagement.members',
     'usermanagement.joinRequests',
     'palaso.ui.notice'
    ])
  .config(function($stateProvider, $urlRouterProvider) {

    
    $urlRouterProvider.otherwise('/members');
    // the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
    $stateProvider.state('members',
          {
            url: '/members',
            views: {
              '@': { templateUrl: '/angular-app/bellows/apps/usermanagement/views/members.html' }
            }
        })
        .state('joinRequests',
            {
              url: '/joinRequests',
              views: {
                '@': { templateUrl: '/angular-app/bellows/apps/usermanagement/views/joinRequests.html' }
              }
          });
    })
  .controller('MainCtrl', ['$scope', 'silNoticeService', '$route', '$routeParams', '$location',
               function($scope, noticeService, $route, $routeParams, $location) {
    $scope.route = $route;
    $scope.location = $location;
    $scope.routeParams = $routeParams;
    $scope.isActive = function(route) {
      return route === $location.path();
    }
  }])
  ;
