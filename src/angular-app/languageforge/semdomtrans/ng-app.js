'use strict';

angular.module('semdomtrans', 
  [
    'ui.router',
    'bellows.services',
    'bellows.filters',
    'semdomtrans.edit',
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/edit');
    
    $stateProvider        
        .state('edit', {
            url: '/edit',
            views: {
            	'': {templateUrl: '/angular-app/languageforge/semdomtrans/views/edit.html', controller: 'editCtrl'},
            	'editQuestions@edit': {
            		templateUrl: '/angular-app/languageforge/semdomtrans/views/editQuestions.html',
            		controller: 'editCtrl'
            	},
            	'editTerm@edit': {
            		templateUrl: '/angular-app/languageforge/semdomtrans/views/editTerm.html',
            		controller: 'editCtrl'
            	}
            }
        });
  })
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
