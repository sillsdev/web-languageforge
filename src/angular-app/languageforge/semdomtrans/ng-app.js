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
    
    $urlRouterProvider.otherwise('/edit');
    
    $stateProvider        
        .state('editor', {
            url: '/edit',
            views: {
              '@': {templateUrl: '/angular-app/languageforge/semdomtrans/views/edit.html' },
              'editItem@editor': {
                templateUrl: '/angular-app/languageforge/semdomtrans/views/partials/editItem.html'
              }  ,
              'editFilter@editor': {
                templateUrl: '/angular-app/languageforge/semdomtrans/views/partials/editFilter.html'
              }
            }
        })
        
        .state('editor.editItem', {
            url: '/:position'
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
   $scope.includedItems = {};
   $scope.comments = [];
   $scope.loadingDto = false;
   $scope.refreshData = function refreshData(v, callback) {
     $scope.loadingDto = true;
     $semdomApi.editorDto(function(result) {
      if (result.ok) {
        $scope.items = result.data.items;
        
        $scope.itemsTree = {};
        for (var i in result.data.items) {
          var item = result.data.items[i];
          $scope.itemsTree[item.key] = { 'content': item, 'children': [], 'parent': ''};
          if (item.key.length >= 3) {
            $scope.itemsTree[item.key.substring(0, item.key.length - 2)].children.push(item.key);
            $scope.itemsTree[item.key].parent = item.key.substring(0, item.key.length - 2);
          }
        }
        
        $scope.comments = result.data.comments;    
        $scope.workingSets = result.data.workingSets;
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
