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

            $scope.show = {buttons: false};

            $scope.showNewReplyForm = false;

            $scope.newReply = {id:'', content:''};

            // I don't necessarily like this, but we keep the comment methods on edit.js so
            // that the view can be refreshed after an update or delete - cjh 2014-08

            $scope.doReply = function doReply() {
                $scope.showNewReplyForm = !$scope.showNewReplyForm;
            };

            $scope.submitReply = function submitReply(reply) {
                $scope.control.updateReply($scope.model.id, reply);
                $scope.newReply = {id:'', content:''};
                for (var i=0; i< $scope.model.replies.length; i++) {
                    $scope.model.replies[i].editing = false;
                }
            };

		}],
		link: function(scope, element, attrs, controller) {
		}
	};
}])
;
