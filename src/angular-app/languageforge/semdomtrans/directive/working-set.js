"use strict";
angular.module('palaso.ui.sd.ws', ['semdomtrans.services', 'palaso.ui.typeahead'])
// Palaso UI Dictionary Control: Example Sentence
.directive('workingSet', function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/semdomtrans/directive/working-set.html',
    scope : {
      model : "=",
      control : "="
    }, 
    controller: ['$scope', function($scope) {
     $scope.original = $scope.model;
     $scope.getButtonName = function getButtonName() {
       if ($scope.model.id == '') {
         return 'Create New Working Set';
       } else  {
         return 'Edit';
       }
       
     }
      
    }],
    link : function(scope, element, attrs, controller) {
    }
  };
});
