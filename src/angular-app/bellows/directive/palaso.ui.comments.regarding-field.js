'use strict';
angular.module('palaso.ui.comments')

// Palaso UI Dictionary Control: Comments
  .directive('regardingField', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.comments.regarding-field.html',
      scope: {
        content: '=',
        control: '=',
        fieldConfig: '='
      },
      controller: ['$scope', function ($scope) {
        if (!angular.isUndefined($scope.content)) {
          $scope.contentArr = $scope.content.split('#');
        }

        $scope.$watch('content', function (newContent) {
          if (angular.isDefined(newContent)) {
            $scope.contentArr = newContent.split('#');
          }
        });
      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }]);
