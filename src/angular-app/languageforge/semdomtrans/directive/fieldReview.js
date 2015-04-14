"use strict";
angular.module('palaso.ui.sd.fieldReview', ['semdomtrans.services'])
.directive('fieldReview', function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/semdomtrans/directive/fieldReview.html',
    scope : {
      model : "=",
      name : "=",
      control : "="
    }, 
    controller: ['$scope', 'semdomtransEditService', function($scope, semdomtransEditService) {
     $scope.showButtons = false;
     $scope.markAsApproved = function markAsApproved() {
       $scope.model.status = 4;
       updateParentItem();
     }
     
     $scope.markAsNeedsRevision = function markAsNeedsRevision() {
       $scope.model.status = 2;
       updateParentItem();
     }
     
     $scope.getAllFieldsForRevison = function getAllFieldsForRevision() {
       
     }
     
     function updateParentItem() {
       semdomtransEditService.updateTerm($scope.control.currentEntry, function(result) {
         if (result.ok) {
            $scope.control.refreshDbeData();
         }
       });
     }
      
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
});
