'use strict';

angular.module('lexCommentsModule')

  // Palaso UI Dictionary Control: Comments
  .directive('dcComment', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/editor/comment/dc-comment.component.html',
      controller: ['$scope', 'lexCommentService', 'sessionService', 'utilService', 'modalService',
        function ($scope, commentService, sessionService, util, modal) {
          $scope.getAvatarUrl = util.constructor.getAvatarUrl;
          $scope.showNewReplyForm = true;
          $scope.newReply = { id: '', editingContent: '' };
          $scope.editingCommentContent = '';
          $scope.posting = false;

          if ($scope.comment.regarding.field && angular.isDefined($scope.control.configService)) {
            $scope.control.configService.getFieldConfig($scope.comment.regarding.field)
              .then(function (config) {
                $scope.commentRegardingFieldConfig = config;
                $scope.isCommentRegardingPicture =
                  (($scope.commentRegardingFieldConfig.type === 'pictures') &&
                    !($scope.comment.regarding.inputSystem));
              });
          }

          $scope.showCommentReplies = function showCommentReplies() {
            $scope.$parent.showNewComment = !$scope.$parent.showNewComment;
            $scope.comment.showRepliesContainer = !$scope.comment.showRepliesContainer;
            $scope.setCommentInteractiveStatus($scope.comment.id,
              $scope.comment.showRepliesContainer);
            $scope.getSenseLabel();
          };

          $scope.doReply = function doReply() {
            hideInputFields();
            $scope.showNewReplyForm = true;
            $scope.isAutoFocusNewReply = true;
          };

          $scope.editReply = function editReply(reply) {
            hideInputFields();
            reply.editing = true;
            reply.editingContent = angular.copy(reply.content);
            reply.isAutoFocusEditing = true;
            $scope.showNewReplyForm = false;
          };

          $scope.cancelReply = function cancelReply(reply) {
            reply.editing = false;
            $scope.showNewReplyForm = true;
          };

          $scope.submitReply = function submitReply(reply, $event) {
            if (angular.isDefined($event)) {
              if ($event.keyCode === 13) {
                // If there is no reply yet then cancel out
                if (!reply.editingContent) {
                  $event.preventDefault();
                  return;
                }
              } else {
                return;
              }
            }

            hideInputFields();
            $scope.posting = true;
            reply.content = angular.copy(reply.editingContent);
            delete reply.editingContent;
            updateReply($scope.comment.id, reply);
            $scope.newReply = { id: '', editingContent: '' };
          };

          function updateReply(commentId, reply) {
            commentService.updateReply(commentId, reply, function (result) {
              if (result.ok) {
                $scope.control.editorService.refreshEditorData().then($scope.loadComments);
                $scope.showNewReplyForm = true;
              }
            });
          }

          $scope.updateCommentStatus = function updateCommentStatus(commentId, status) {
            commentService.updateStatus(commentId, status, function (result) {
              if (result.ok) {
                $scope.control.editorService.refreshEditorData().then($scope.loadComments);
                $scope.posting = false;
              }
            });
          };

          $scope.deleteComment = function deleteComment(comment) {
            var deletemsg;
            sessionService.getSession().then(function (session) {
              if (session.userId() === comment.authorInfo.createdByUserRef.id) {
                deletemsg = 'Are you sure you want to delete your own comment?';
              } else {
                deletemsg = 'Are you sure you want to delete ' +
                  comment.authorInfo.createdByUserRef.name + '\'s comment?';
              }

              modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment')
                .then(function () {
                  commentService.remove(comment.id).then(function () {
                    $scope.control.editorService.refreshEditorData().then($scope.loadComments);
                  });

                  commentService.removeCommentFromLists(comment.id);
                }, angular.noop);
            });
          };

          $scope.deleteCommentReply = function deleteCommentReply(commentId, reply) {
            var deletemsg;
            sessionService.getSession().then(function (session) {
              if (session.userId() === reply.authorInfo.createdByUserRef.id) {
                deletemsg = 'Are you sure you want to delete your own comment reply?';
              } else {
                deletemsg = 'Are you sure you want to delete ' +
                  reply.authorInfo.createdByUserRef.name + '\'s comment reply?';
              }

              modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply')
                .then(function () {
                  commentService.deleteReply(commentId, reply.id).then(function () {
                    $scope.control.editorService.refreshEditorData().then($scope.loadComments);
                  });

                  commentService.removeCommentFromLists(commentId, reply.id);
                }, angular.noop);
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

            commentService.update($scope.comment).then(function () {
              $scope.control.editorService.refreshEditorData().then($scope.loadComments);
            });

            $scope.editingCommentContent = '';
          };

          function hideInputFields() {
            for (var i = 0; i < $scope.comment.replies.length; i++) {
              $scope.comment.replies[i].editing = false;
            }

            $scope.comment.editing = false;
          }

          $scope.getSenseLabel = function getSenseLabel() {
            return $scope.$parent.getSenseLabel($scope.comment.regarding.field,
              $scope.comment.contextGuid);
          };

          $scope.isOriginalRelevant = function isOriginalRelevant() {
            if ($scope.comment.regarding.fieldValue) {
              if ($scope.getCurrentContextValue() !== $scope.comment.regarding.fieldValue) {
                return true;
              }
            }

            return false;
          };

          $scope.getCurrentContextValue = function getCurrentContextValue() {
            var contextParts = $scope.control.getContextParts($scope.comment.contextGuid);
            if (contextParts.option.key !== '' &&
              (contextParts.fieldConfig.type === 'multioptionlist' ||
                (contextParts.fieldConfig.type === 'optionlist' &&
                  $scope.control.commentContext.contextGuid === ''))
              ) {
              return contextParts.option.label;
            } else if (contextParts.fieldConfig.type === 'pictures' &&
                  !contextParts.inputSystem &&
                  $scope.control.commentContext.contextGuid === '') {
              return 'Something different just to force it to display';
            } else {
              return contextParts.value;
            }
          };

          $scope.getCommentRegardingPictureSource = function getCommentRegardingPictureSource() {
            if (!$scope.isCommentRegardingPicture) {
              return '';
            }

            var contextParts = $scope.control.getContextParts($scope.comment.contextGuid);
            var imageSrc = '';
            var pictures = null;
            if (contextParts.example.guid) {
              pictures = $scope.control.currentEntry.senses[contextParts.sense.index]
                .examples[contextParts.example.index].pictures;
            } else if (contextParts.sense.guid) {
              pictures = $scope.control.currentEntry.senses[contextParts.sense.index].pictures;
            }

            for (var i in pictures) {
              if (pictures.hasOwnProperty(i) && pictures[i].guid === contextParts.value) {
                imageSrc = pictures[i].fileName;
              }
            }

            if (imageSrc) {
              imageSrc = '/assets/lexicon/' + $scope.control.project.slug + '/pictures/' + imageSrc;
            }

            return imageSrc;
          };

        }]

    };
  }]);
