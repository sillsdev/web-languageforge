"use strict";
angular.module('palaso.ui.comments')
// Palaso UI Dictionary Control: Comments
  .directive('regardingField', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/palaso.ui.comments.regarding-field.html',
      scope: {
        content: "=",
        control: "=",
        commentRegardingFieldConfig: "="
      },
      controller: ['$scope', function($scope) {
          if (!angular.isUndefined($scope.content)) {
            $scope.contentArr = $scope.content.split("#");
          }
          
          $scope.$watch("content", function(newVal) {
            if (newVal && !angular.isUndefined($scope.content)) {
                $scope.contentArr = $scope.content.split("#");
              }
            });
       }],
      link: function(scope, element, attrs, controller) {
      }
    };
  }]);