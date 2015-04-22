'use strict';

angular.module('semdomtrans', 
  [
    'ui.router',
    'bellows.services',
    'bellows.services.comments',
    'bellows.filters',
    'semdomtrans.edit',
    'semdomtrans.comments',
    'semdomtrans.services',
    'semdomtrans.review',
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
        
        .state('review',  {
            url: '/review',
            views: {
              '': {templateUrl: '/angular-app/languageforge/semdomtrans/views/review.html'}
            }
        })
  })
  .controller('MainCtrl', ['$scope', 'semdomtransEditorDataService', 'sessionService', 'lexCommentService', 'offlineCache', '$q',
  function($scope, editorDataService, ss, commentsSerivce, offlineCache, $q) {    
   $scope.rights = {};
   $scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE); 
   $scope.rights.create = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE); 
   $scope.rights.edit = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
   
   $scope.items = editorDataService.entries;
   $scope.workingSets = editorDataService.workingSets;
   $scope.itemsTree = editorDataService.itemsTree;
   
   if ($scope.items.length == 0 && !$scope.loadingDto) {
     editorDataService.loadEditorData().then(function(result) {
       editorDataService.processEditorDto(result);
     });
   }
   
   
   $scope.includedItems = {};
   $scope.loadingDto = false;  
   
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
