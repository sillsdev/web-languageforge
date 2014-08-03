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

            $scope.hover = { comment: false };

            $scope.showNewReplyForm = false;

            $scope.newReply = {id:'', content:''};

            // I don't necessarily like this, but we keep the comment methods on edit.js so
            // that the view can be refreshed after an update or delete - cjh 2014-08

            $scope.doReply = function doReply() {
                hideInputFields();
                $scope.showNewReplyForm = true;
            };

            $scope.editReply = function editReply(reply) {
                hideInputFields();
                reply.editing = true;
            };

            $scope.submitReply = function submitReply(reply) {
                $scope.control.updateReply($scope.model.id, reply);
                $scope.newReply = {id:'', content:''};
            };

            $scope.editComment = function editComment() {
                hideInputFields();
                $scope.model.editing = true;
            };

            $scope.updateComment = function updateComment() {
                $scope.control.updateComment($scope.model);
            };

            function hideInputFields() {
                for (var i=0; i< $scope.model.replies.length; i++) {
                    $scope.model.replies[i].editing = false;
                }
                $scope.showNewReplyForm = false;
                $scope.model.editing = false;
            }

		}],
		link: function(scope, element, attrs, controller) {
		}
	};
}])
;
