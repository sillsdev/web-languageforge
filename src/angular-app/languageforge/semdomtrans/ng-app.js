'use strict';

angular.module('semdomtrans', 
  [
    'ngRoute',
    'bellows.services',
    'bellows.filters'
  ])
  .config(['$routeProvider', function($routeProvider) {

        // TODO: refactor to use ui-router instead of ngRoute
    
    // the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
    $routeProvider.when('/projects', { template: ' ', controller: function() { window.location.replace('/app/projects'); } });
    
    $routeProvider.when( '/', { redirectTo: '/edit' });
    
	$routeProvider.when(
        '/edit',
            {
                templateUrl: '/angular-app/languageforge/semdomtrans/views/edit.html'
	    }
	);
    $routeProvider.when(
        '/settings',
        {
          templateUrl: '/angular-app/languageforge/semdomtrans/views/settings.html'
        }
      );
    $routeProvider.when(
        '/users',
        {
          templateUrl: '/angular-app/languageforge/semdomtrans/views/manage-users.html'
        }
      );
    $routeProvider.otherwise({redirectTo: '/projects'});
  }])

  .controller('MainCtrl', ['$scope', 'sessionService',
  function($scope, ss) {
    
    $scope.rights = {};
    $scope.project = ss.session.project;
    $scope.projectSettings = ss.session.projectSettings;
    
    $scope.currentUserRole = ss.session.projectSettings.currentUserRole;
    
  }])

// not sure if we need breadcrumbs for this app
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService', function($scope, $rootScope, breadcrumbService) {
    $scope.idmap = breadcrumbService.idmap;
    $rootScope.$on('$routeChangeSuccess', function(event, current) {
      $scope.breadcrumbs = breadcrumbService.read();
    });
    $scope.$watch('idmap', function(newVal, oldVal, scope) {
      $scope.breadcrumbs = breadcrumbService.read();
    }, true);
  }])
  ;
