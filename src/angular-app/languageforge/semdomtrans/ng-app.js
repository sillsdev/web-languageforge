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
  .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    
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
  }])
  .controller('MainCtrl', ['$scope', 'semdomtransEditorDataService', 'semdomtransEditService', 'sessionService', 'lexCommentService', 'offlineCache', '$q', 'silNoticeService',
  function($scope, editorDataService, editorApi, ss, commentsSerivce, offlineCache, $q, notice) {    
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
   
   $scope.exportProject = function exportProject() {
     notice.setLoading("Exporting Semantic Domain Data to XML File");
     editorApi.exportProject(function (result) {
       notice.cancelLoading();
       if (result.ok) {
         window.location = "http://" + result.data;
       }
     })
   }
   
   $scope.includedItems = {};
   $scope.loadingDto = false;  
   
   // permissions stuff
   $scope.rights = {
     canEditProject: function canEditProject() {
       return ss.hasProjectRight(ss.domain.PROJECTS, ss.operation.EDIT);
     },
     canEditEntry: function canEditEntry() {
       return ss.hasProjectRight(ss.domain.ENTRIES, ss.operation.EDIT);
     },
     canDeleteEntry: function canDeleteEntry() {
       return ss.hasProjectRight(ss.domain.ENTRIES, ss.operation.DELETE);
     },
     canComment: function canComment() {
       return ss.hasProjectRight(ss.domain.COMMENTS, ss.operation.CREATE);
     },
     canDeleteComment: function canDeleteComment(commentAuthorId) {
       if (ss.session.userId == commentAuthorId) {
         return ss.hasProjectRight(ss.domain.COMMENTS, ss.operation.DELETE_OWN);
       } else {
         return ss.hasProjectRight(ss.domain.COMMENTS, ss.operation.DELETE);
       }
     },
     canEditComment: function canEditComment(commentAuthorId) {
       if (ss.session.userId == commentAuthorId) {
         return ss.hasProjectRight(ss.domain.COMMENTS, ss.operation.EDIT_OWN);
       } else {
         return false;
       }
     },
     canUpdateCommentStatus: function canUpdateCommentStatus() {
       return ss.hasProjectRight(ss.domain.COMMENTS, ss.operation.EDIT);
     }
   };
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
