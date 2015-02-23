"use strict";
angular.module('palaso.ui.commentBubble', [])
.directive('commentBubble', [function() {
  return {
    restrict : 'E',
    templateUrl : '/angular-app/languageforge/lexicon/directive/comment-bubble.html',
    scope : {
            count : "=",
            control : "="
    },
    controller: ['$scope', function($scope) {
            $scope.getCountForDisplay = function getCountForDisplay() {
                if ($scope.count) {
                    if ($scope.count < 10) {
                        return ' ' + $scope.count;
                    } else {
                        return $scope.count;
                    }
                } else {
                    return '';
                }
            };

    }],
    link : function(scope, element, attrs, controller) {
    }
  };
}])
;
