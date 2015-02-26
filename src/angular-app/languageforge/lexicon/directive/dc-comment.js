"use strict";
angular.module('palaso.ui.dc.comment', ['palaso.ui.utils'])
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

            $scope.newReply = {id:'', editingContent:''};

            $scope.editingCommentContent = '';

            // I don't necessarily like this, but we keep the comment methods on edit.js so
            // that the view can be refreshed after an update or delete - cjh 2014-08

            $scope.doReply = function doReply() {
                hideInputFields();
                $scope.showNewReplyForm = true;
            };

            $scope.editReply = function editReply(reply) {
                hideInputFields();
                reply.editing = true;
                reply.editingContent = angular.copy(reply.content);
            };

            $scope.submitReply = function submitReply(reply) {
                hideInputFields();
                reply.content = angular.copy(reply.editingContent);
                delete reply.editingContent;
                $scope.control.updateReply($scope.model.id, reply);
                $scope.newReply = {id:'', editingContent:''};
            };

            $scope.editComment = function editComment() {
                hideInputFields();
                $scope.model.editing = true;
                $scope.editingCommentContent = angular.copy($scope.model.content);
            };

            $scope.updateComment = function updateComment() {
                hideInputFields();
                $scope.model.content = angular.copy($scope.editingCommentContent);
                $scope.control.updateComment($scope.model);
                $scope.editingCommentContent = '';
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
