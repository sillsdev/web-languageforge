'use strict';

angular.module('semdomtransCommentsViewModule', ['lexCommentsModule'])

  // Palaso UI Dictionary Control: Comments
  .directive('semdomtransCommentsView', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/semdomtrans/directive/' +
        'palaso.ui.comments.semdomtrans-comments-view.html',
      scope: {
        control: '=',
        entry: '='
      },
      controller: ['$scope', function ($scope) {

        $scope.control.setSelectedField = function setSelectedField(fieldName, model) {
          $scope.newComment.regarding.field = fieldName;
          $scope.newComment.regarding.fieldNameForDisplay = fieldName;
          $scope.newComment.regarding.fieldValue = model.source + '#' + model.translation;
        };

      }]
    };
  }])

;
