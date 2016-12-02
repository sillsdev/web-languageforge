'use strict';
angular.module('palaso.ui.comments')

// Palaso UI Dictionary Control: Comments
  .directive('dcComment', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/' + bootstrapVersion + '/palaso.ui.comments.dc-comment.html',
      controller: ['$scope', 'lexCommentService', 'sessionService', 'utilService', 'modalService',
      function ($scope, commentService, sessionService, util, modal) {
        $scope.getAvatarUrl = util.getAvatarUrl;

        $scope.hover = { comment: false };

        $scope.showNewReplyForm = false;

        $scope.newReply = { id:'', editingContent:'' };

        $scope.editingCommentContent = '';

        if ($scope.comment.regarding.field && angular.isDefined($scope.control.configService)) {
          $scope.commentRegardingFieldConfig =
            $scope.control.configService.getFieldConfig($scope.comment.regarding.field);
          $scope.isCommentRegardingPicture =
            (($scope.commentRegardingFieldConfig.type == 'pictures') &&
            !($scope.comment.regarding.inputSystem));
        }

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
          updateReply($scope.comment.id, reply);
          $scope.newReply = { id:'', editingContent:'' };
        };

        function updateReply(commentId, reply) {
          commentService.updateReply(commentId, reply, function (result) {
            if (result.ok) {
              $scope.control.editorDataService.refreshEditorData().then(function () {
                $scope.loadComments();
              });
            }
          });
        }

        $scope.updateCommentStatus = function updateCommentStatus(commentId, status) {
          commentService.updateStatus(commentId, status, function (result) {
            if (result.ok) {
              $scope.control.editorDataService.refreshEditorData().then(function () {
                $scope.loadComments();
              });
            }
          });
        };

        $scope.deleteComment = function deleteComment(comment) {
          var deletemsg;
          if (sessionService.session.userId == comment.authorInfo.createdByUserRef.id) {
            deletemsg = 'Are you sure you want to delete your own comment?';
          } else {
            deletemsg = 'Are you sure you want to delete ' +
              comment.authorInfo.createdByUserRef.name + '\'s comment?';
          }

          modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment')
            .then(function () {
              commentService.remove(comment.id, function (result) {
                if (result.ok) {
                  $scope.control.editorDataService.refreshEditorData().then(function () {
                    $scope.loadComments();
                  });
                }
              });

              commentService.removeCommentFromLists(comment.id);
            });
        };

        $scope.deleteCommentReply = function deleteCommentReply(commentId, reply) {
          var deletemsg;
          if (sessionService.session.userId == reply.authorInfo.createdByUserRef.id) {
            deletemsg = 'Are you sure you want to delete your own comment reply?';
          } else {
            deletemsg = 'Are you sure you want to delete ' +
              reply.authorInfo.createdByUserRef.name + '\'s comment reply?';
          }

          modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply')
            .then(function () {
              commentService.deleteReply(commentId, reply.id, function (result) {
                if (result.ok) {
                  $scope.control.editorDataService.refreshEditorData().then(function () {
                    $scope.loadComments();
                  });
                }
              });

              commentService.removeCommentFromLists(commentId, reply.id);
            });
        };

        $scope.editComment = function editComment() {
          hideInputFields();
          $scope.comment.editing = true;
          $scope.editingCommentContent = angular.copy($scope.comment.content);
        };

        $scope.updateComment = function updateComment() {
          hideInputFields();
          $scope.comment.content = angular.copy($scope.editingCommentContent);

          commentService.update($scope.comment, function (result) {
            if (result.ok) {
              $scope.control.editorDataService.refreshEditorData().then(function () {
                $scope.loadComments();
              });
            }
          });

          $scope.editingCommentContent = '';
        };

        function hideInputFields() {
          for (var i = 0; i < $scope.comment.replies.length; i++) {
            $scope.comment.replies[i].editing = false;
          }

          $scope.showNewReplyForm = false;
          $scope.comment.editing = false;
        }

      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }]);
