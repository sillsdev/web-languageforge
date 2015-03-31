"use strict";
angular.module('palaso.ui.sd.term', ['semdomtrans.services'])
// Palaso UI Dictionary Control: Example Sentence
.directive('sdTerm', function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/semdomtrans/directive/sd-term.html',
    scope : {
      model : "=",
      state : "@",
      control : "="
    }, 
    controller: ['$scope', "semdomtransEditService", function($scope, semdomApi) {
      var api = semdomApi;
      $scope.updateItem = function updateItem(v) {
        if ($scope.state === "edit") {
          v = (v === undefined) ? 13 : v;
          if (v == 13) {
            api.updateTerm($scope.model, function(result) {
              ;
            });
          }
        }
      }
      
      $scope.changeState = function changeState(state) {
        $scope.state = state;
      }
      
      
      $scope.isInCommentMode = function isInCommentMode() {
        return $scope.state == 'comments';
      }
      
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
});
