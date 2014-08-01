"use strict";
angular.module('palaso.ui.dc.comment', [])
// Palaso UI Dictionary Control: Comments
.directive('dcComment', [function() {
	return {
		restrict: 'E',
		templateUrl: '/angular-app/languageforge/lexicon/directive/dc-comment.html',
		scope: {
			model : "=",
			control: "="
		},
		controller: ['$scope', function($scope) {

            // I don't necessarily like this, but we keep the comment methods on edit.js so
            // that the view can be refreshed after an update or delete - cjh 2014-08

            // do we even need these on the controller?
            $scope.editComment = function editComment() {  };

            $scope.editReply = function editReply() {};

            $scope.deleteComment = function deleteComment() {};

            $scope.deleteReply = function deleteReply() {};


		}],
		link: function(scope, element, attrs, controller) {
		}
	};
}])
;
