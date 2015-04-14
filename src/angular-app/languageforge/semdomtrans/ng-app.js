'use strict';

angular.module('semdomtrans', 
  [
    'ui.router',
    'bellows.services',
    'bellows.filters',
    'semdomtrans.edit',
    'semdomtrans.comments',
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
  .controller('MainCtrl', ['$scope', 'semdomtransEditService', 'sessionService', 'lexCommentService', 'offlineCache', '$q',
  function($scope, $semdomApi, ss, commentsSerivce, offlineCache, $q) {    
   $scope.rights = {};
   $scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE); 
   $scope.rights.create = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE); 
   $scope.rights.edit = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
   
   $scope.items = [];
   $scope.includedItems = {};
   $scope.comments = [];
   $scope.loadingDto = false;
   
   var offlineCacheKey = ss.session.baseSite + "_" + ss.session.project.id;
   

   /**
    * Persists the Lexical data in the offline cache store
    */
   function storeDataInOfflineCache(timestamp) {
     var deferred = $q.defer();
     if (timestamp && offlineCache.canCache()) {
       var dataObj = {
         items: $scope.items,
         comments: $scope.comments,
         workingSets: $scope.workingSets
       };
       offlineCache.setObject(offlineCacheKey, timestamp, dataObj).then(function() {
         deferred.resolve();
       })
     }
     return deferred.promise;
   }

   /**
    *
    * @returns {promise} which resolves to an epoch cache timestamp
    */
   function loadDataFromOfflineCache() {
     var deferred = $q.defer();
     offlineCache.getObject(offlineCacheKey).then(function(result) {
       $scope.comments = result.data.comments;
       $scope.items = result.data.items;
       $scope.workingSets = result.data.workingSets;
       constructSemdomTree($scope.items);
       deferred.resolve(result.timestamp);
     }, function() { deferred.reject(); });
     return deferred.promise;
   }
   
   function constructItemPosMap(items) {
     $scope.keyPosMap = {};
     for (var i in items) {
       $scope.keyPosMap[items[i].key] = i;
     }
   }
   
   function constructCommentPosMap(comments) {
     $scope.keyPosMap = {};
     for (var i in comments) {
       $scope.keyPosMap[comments[i].id] = i;
     }
   }
   
   function constructSemdomTree(items) {
     $scope.itemsTree = {};
     for (var i in items) {
       var item = items[i];
       $scope.itemsTree[item.key] = { 'content': item, 'children': [], 'parent': ''};
       if (item.key.length >= 3) {
         $scope.itemsTree[item.key.substring(0, item.key.length - 2)].children.push(item.key);
         $scope.itemsTree[item.key].parent = item.key.substring(0, item.key.length - 2);
       }
     }
   }
   
   function createShowAllWorkingSet(items) {
     var allItemsWS = { id: '',  name: 'Show All', isShared : false, itemKeys : [] }
     
     for (var i in items) {
       allItemsWS.itemKeys.push(items[i].key);
     }
     
     return allItemsWS;
   }
   
   $scope.loadDbeData = function loadDbeData() {
     var deferred = $q.defer();
     if ($scope.items.length == 0) { // first page load
       if (offlineCache.canCache()) {
         loadDataFromOfflineCache().then(function(timestamp) {
           // data found in cache
           console.log("data successfully loaded from the cache, now performing refresh");
           
           $scope.refreshDbeData(timestamp).then(function() {
             deferred.resolve();
           });

         }, function() {
           // no data found in cache
           $semdomApi.editorDto(null, function(result) {
             if (result.ok) {
               processDbeData(result, false);
       
               deferred.resolve();
             }
          });

         });
       }
     }
     return deferred.promise;
   }
   
   $scope.refreshDbeData = function refreshDbeData(timestamp) {    
     var deferred = $q.defer();
     $scope.loadingDto = true;
     $semdomApi.editorDto(timestamp, function(result) {
        if (result.ok) {
          processDbeData(result, true);
          deferred.resolve();
        }
     });
     
     return deferred.promise;
   }
   
    function processDbeData(result, updateOnly) {
     if (result.ok) {
       if(!updateOnly) {
         $scope.items = result.data.items;
         $scope.comments = result.data.comments;    
         
         constructSemdomTree($scope.items);        
         var allItemsWS = createShowAllWorkingSet($scope.items);
         
         //constructItemPosMap(items);
         //constructCommentPosMap(comments);
         
         $scope.workingSets = [allItemsWS].concat(result.data.workingSets);
         $scope.loadingDto = false;
         
         $scope.statuses = result.data.statuses;
         
         commentsSerivce.updateGlobalCommentCounts();
         commentsSerivce.comments.items.all = $scope.comments;
       } else {
         
         // splicing in items
         for (var i in result.data.items) {
           var item = result.data.items[i];
           var pos = findPos($scope.items, item.id)
           if (pos > -1) {
             $scope.items[pos] = item;
           } else {
             $scope.items.push(item);
           }
         }
         
         // splicing in comments
         for (var i in result.data.comments) {
           var c = result.data.comments[i];
           var pos = findPos($scope.comments, c.id)
           if (pos > - 1) {
             $scope.comments[pos] = c;
           } else {
             $scope.comments.push(c);
           }
         }
         
         // splicing in working sets
         for (var i in result.data.workingSets) {
           var ws = result.data.workingSets[i];
           var pos = findPos($scope.workingSets, ws.id)
           if (pos > -1) {
             $scope.workingSets[pos] = ws;
           } else {
             $scope.workingSets.push(ws);
           }
         }
       }
       
       storeDataInOfflineCache(result.data.timeOnServer);
     }
     
   }
   
   function findPos(arr, id) {
     for (var i in arr) {
       if (arr[i].id == id) {
         return i;
       }
     }
     
     return -1;
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
