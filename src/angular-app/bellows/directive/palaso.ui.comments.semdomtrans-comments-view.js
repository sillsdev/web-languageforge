"use strict";
angular.module('palaso.ui.comments')
// Palaso UI Dictionary Control: Comments

  .directive('semdomtransCommentsView', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.comments.semdomtrans-comments-view.html',
      scope: {
        control: "=",
        entry: "="
      },
      controller: ['$scope', function($scope) {

        $scope.control.setSelectedField = function setSelectedField(fieldName, model) {
          $scope.newComment.regarding.field = fieldName;
          $scope.newComment.regarding.fieldNameForDisplay = fieldName;
          $scope.newComment.regarding.fieldValue = model.source + "#" + model.translation;  
        }
       
      }],
      link: function(scope, element, attrs, controller) {

      }
    };
  }])
;

    