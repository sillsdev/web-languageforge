import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {UtilityService} from '../../../../bellows/core/utility.service';
import {LexComment, LexCommentReply} from '../../shared/model/lex-comment.model';
import {LexConfigField} from '../../shared/model/lexicon-config.model';

class Reply extends LexCommentReply {
  editingContent?: string;
  isHover?: boolean;
  isAutoFocusEditing?: boolean;
  isEditing?: boolean;
}

export function CommentComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/dc-comment.component.html',
    controller: ['$scope', 'lexCommentService', 'sessionService', 'modalService',
      ($scope: any, commentService: LexiconCommentService, sessionService: SessionService, modal: ModalService) => {
        $scope.getAvatarUrl = UtilityService.getAvatarUrl;
        $scope.showNewReplyForm = true;
        $scope.newReply = { id: '', editingContent: '' };
        $scope.editingCommentContent = '';
        $scope.posting = false;

        if ($scope.comment.regarding.field && $scope.control.configService != null) {
          $scope.control.configService.getFieldConfig($scope.comment.regarding.field).then((config: LexConfigField) => {
            $scope.commentRegardingFieldConfig = config;
            $scope.isCommentRegardingPicture =
              (($scope.commentRegardingFieldConfig.type === 'pictures') && !($scope.comment.regarding.inputSystem));
          });
        }

        $scope.showCommentReplies = function showCommentReplies(): void {
          $scope.$parent.showNewComment = !$scope.$parent.showNewComment;
          $scope.comment.showRepliesContainer = !$scope.comment.showRepliesContainer;
          $scope.setCommentInteractiveStatus($scope.comment.id, $scope.comment.showRepliesContainer);
          $scope.getSenseLabel();
        };

        $scope.doReply = function doReply(): void {
          hideInputFields();
          $scope.showNewReplyForm = true;
          $scope.isAutoFocusNewReply = true;
        };

        $scope.editReply = function editReply(reply: Reply): void {
          hideInputFields();
          reply.isEditing = true;
          reply.editingContent = angular.copy(reply.content);
          reply.isAutoFocusEditing = true;
          $scope.showNewReplyForm = false;
        };

        $scope.cancelReply = function cancelReply(reply: Reply): void {
          reply.isEditing = false;
          $scope.showNewReplyForm = true;
        };

        $scope.submitReply = function submitReply(reply: Reply, $event?: KeyboardEvent): void {
          if ($event != null) {
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

        function updateReply(commentId: string, reply: LexCommentReply): void {
          commentService.updateReply(commentId, reply, result => {
            if (result.ok) {
              $scope.control.editorService.refreshEditorData().then($scope.loadComments);
              $scope.showNewReplyForm = true;
            }
          });
        }

        $scope.updateCommentStatus = function updateCommentStatus(commentId: string, status: string): void {
          commentService.updateStatus(commentId, status, result => {
            if (result.ok) {
              $scope.control.editorService.refreshEditorData().then($scope.loadComments);
              $scope.posting = false;
            }
          });
        };

        $scope.deleteComment = function deleteComment(comment: LexComment): void {
          let deletemsg;
          sessionService.getSession().then(session => {
            if (session.userId() === comment.authorInfo.createdByUserRef.id) {
              deletemsg = 'Are you sure you want to delete your own comment?';
            } else {
              deletemsg = 'Are you sure you want to delete ' +
                comment.authorInfo.createdByUserRef.name + '\'s comment?';
            }

            modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment') .then(() => {
              commentService.remove(comment.id).then(() => {
                $scope.control.editorService.refreshEditorData().then($scope.loadComments);
              });

              commentService.removeCommentFromLists(comment.id);
            }, () => {});
          });
        };

        $scope.deleteCommentReply = function deleteCommentReply(commentId: string, reply: LexCommentReply): void {
          let deletemsg;
          sessionService.getSession().then(session => {
            if (session.userId() === reply.authorInfo.createdByUserRef.id) {
              deletemsg = 'Are you sure you want to delete your own comment reply?';
            } else {
              deletemsg = 'Are you sure you want to delete ' +
                reply.authorInfo.createdByUserRef.name + '\'s comment reply?';
            }

            modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply').then(() => {
              commentService.deleteReply(commentId, reply.id).then(() => {
                $scope.control.editorService.refreshEditorData().then($scope.loadComments);
              });

              commentService.removeCommentFromLists(commentId, reply.id);
            }, () => {});
          });
        };

        $scope.editComment = function editComment(): void {
          hideInputFields();
          $scope.comment.editing = true;
          $scope.editingCommentContent = angular.copy($scope.comment.content);
        };

        $scope.updateComment = function updateComment(): void {
          hideInputFields();
          $scope.comment.content = angular.copy($scope.editingCommentContent);

          commentService.update($scope.comment).then(() => {
            $scope.control.editorService.refreshEditorData().then($scope.loadComments);
          });

          $scope.editingCommentContent = '';
        };

        function hideInputFields(): void {
          for (const reply of $scope.comment.replies) {
            reply.isEditing = false;
          }

          $scope.comment.editing = false;
        }

        $scope.getSenseLabel = function getSenseLabel(): string {
          return $scope.$parent.getSenseLabel($scope.comment.regarding.field, $scope.comment.contextGuid);
        };

        $scope.isOriginalRelevant = function isOriginalRelevant(): boolean {
          if ($scope.comment.regarding.fieldValue) {
            if ($scope.getCurrentContextValue() !== $scope.comment.regarding.fieldValue) {
              return true;
            }
          }

          return false;
        };

        $scope.getCurrentContextValue = function getCurrentContextValue(): string {
          const contextParts = $scope.control.getContextParts($scope.comment.contextGuid);
          if (contextParts.option.key !== '' && (contextParts.fieldConfig.type === 'multioptionlist' ||
              (contextParts.fieldConfig.type === 'optionlist' && $scope.control.commentContext.contextGuid === ''))
          ) {
            return contextParts.option.label;
          } else if (contextParts.fieldConfig.type === 'pictures' && !contextParts.inputSystem &&
            $scope.control.commentContext.contextGuid === ''
          ) {
            return 'Something different just to force it to display';
          } else {
            return contextParts.value;
          }
        };

        $scope.getCommentRegardingPictureSource = function getCommentRegardingPictureSource(): string {
          if (!$scope.isCommentRegardingPicture) {
            return '';
          }

          const contextParts = $scope.control.getContextParts($scope.comment.contextGuid);
          let imageSrc = '';
          let pictures = null;
          if (contextParts.example.guid) {
            pictures = $scope.control.currentEntry.senses[contextParts.sense.index]
              .examples[contextParts.example.index].pictures;
          } else if (contextParts.sense.guid) {
            pictures = $scope.control.currentEntry.senses[contextParts.sense.index].pictures;
          }

          for (const i in pictures) {
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
}
