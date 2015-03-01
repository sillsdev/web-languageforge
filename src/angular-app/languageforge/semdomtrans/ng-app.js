'use strict';

angular.module('semdomtrans', 
  [
    'ui.router',
    'bellows.services',
    'bellows.filters',
    'semdomtrans.edit',
    'semdomtrans.comments',
    'pascalprecht.translate' 
  ])
  .config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/edit/0');
    
    $stateProvider        
        .state('edit', {
            url: '/edit/:position',
            views: {
              '@': {templateUrl: '/angular-app/languageforge/semdomtrans/views/edit.html' },
              'editItem@edit': {
                templateUrl: '/angular-app/languageforge/semdomtrans/views/partials/editItem.html'
              }  
            }
        })
        
        .state('comments', {
            url: '/comments/:position',
            views: {
              '': {templateUrl: '/angular-app/languageforge/semdomtrans/views/comments.html'}
            }
        })
  })
  .controller('MainCtrl', ['$scope', 'semdomtransEditService', 'sessionService',
  function($scope, $semdomApi, ss) {
    
   $scope.items = [];
   $scope.comments = [];
   $scope.itemIndex  = 0;
   $scope.loadingDto = false;
   $scope.refreshData = function refreshData(v, callback) {
     $scope.loadingDto = true;
     $semdomApi.editorDto(function(result) {
      if (result.ok) {
        $scope.items = result.data.items;  
        $scope.comments = result.data.comments;    
        $scope.currentEntry = $scope.items[$scope.itemIndex ];
        $scope.loadingDto = false;
        if (!angular.isUndefined(callback)) {
          callback();
        }
      }
    });
   }
  
   
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
