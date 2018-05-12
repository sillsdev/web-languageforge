import * as angular from 'angular';

import {LexiconCommentService} from '../../../../bellows/core/offline/lexicon-comments.service';
import {SessionService} from '../../../../bellows/core/session.service';
import {LexComment} from '../../shared/model/lex-comment.model';
import {LexEntry} from '../../shared/model/lex-entry.model';

export function CommentsRightPanelComponent() {
  return {
    restrict: 'E',
    templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comments-right-panel.component.html',
    scope: {
      entry: '=',
      control: '=',
      newComment: '='
    },
    controller: ['$scope', 'lexCommentService', 'sessionService',
    ($scope: any, commentService: LexiconCommentService, sessionService: SessionService) => {

      /*  $scope.newComment has the following initial structure
       {
       id: '',
       content: '',
       regarding: {}
       };
       */
      $scope.showNewComment = false;
      $scope.senseLabel = '';
      $scope.posting = false;
      $scope.commentInteractiveStatus = {
        id: '',
        visible: false
      };

      $scope.initializeNewComment = function initializeNewComment(): void {
        if ($scope.showNewComment && $scope.entry.id === $scope.newComment.entryRef) {
          if ($scope.posting) {
            $scope.newComment.content = '';
          }
        } else {
          $scope.newComment = {
            id: '',
            content: '',
            entryRef: $scope.entry.id,
            regarding: {},
            contextGuid: ''
          };
        }
      };

      $scope.currentEntryCommentsFiltered = commentService.comments.items.currentEntryFiltered;

      $scope.numberOfComments = function numberOfComments(): number {
        return commentService.comments.counts.currentEntry.total;
      };

      $scope.commentFilter = {
        text: '',
        status: 'all',
        contextGuid: '',
        byText: function byText(comment: LexComment): boolean {
          // Convert entire comment object to a big string and search for filter.
          // Note: This has a slight side effect of ID and avatar information
          // matching the filter.
          return (JSON.stringify(comment).normalize().toLowerCase()
            .indexOf($scope.commentFilter.text.normalize().toLowerCase()) !== -1);
        },

        byStatus: function byStatus(comment: LexComment): boolean {
          if (comment != null) {
            if ($scope.commentFilter.status === 'all') {
              return true;
            } else if ($scope.commentFilter.status === 'todo') {
              if (comment.status === 'todo') {
                return true;
              }
            } else if ($scope.commentFilter.status === 'resolved') {
              if (comment.status === 'resolved') {
                return true;
              }
            } else { // show unresolved comments
              if (comment.status !== 'resolved') {
                return true;
              }
            }
          }

          return false;
        },

        byContext: function byContext(comment: LexComment): boolean {
          if (comment == null) {
            return false;
          } else if (!$scope.commentFilter.contextGuid) {
            // Return true as we're most likely not running a valid context search so return all
            return true;
          } else if ($scope.commentFilter.contextGuid) {
            // All new comments will have a context ID available
            return (comment.contextGuid === $scope.commentFilter.contextGuid);
          }

          return false;
        }
      };

      sessionService.getSession().then(session => {
        $scope.rights = {
          canComment: function canComment(): boolean {
            if (session.project().isArchived) return false;
            return session.hasProjectRight(sessionService.domain.COMMENTS,
              sessionService.operation.CREATE);
          },

          canDeleteComment: function canDeleteComment(commentAuthorId: string): boolean {
            if (session.project().isArchived) return false;
            if (session.userId() === commentAuthorId) {
              return session.hasProjectRight(sessionService.domain.COMMENTS,
                sessionService.operation.DELETE_OWN);
            } else {
              return session.hasProjectRight(sessionService.domain.COMMENTS,
                sessionService.operation.DELETE);
            }
          },

          canEditComment: function canEditComment(commentAuthorId: string): boolean {
            if (session.project().isArchived) return false;
            if (session.userId() === commentAuthorId) {
              return session.hasProjectRight(sessionService.domain.COMMENTS,
                sessionService.operation.EDIT_OWN);
            } else {
              return false;
            }
          },

          canUpdateCommentStatus: function canUpdateCommentStatus(): boolean {
            if (session.project().isArchived) return false;
            return session.hasProjectRight(sessionService.domain.COMMENTS,
              sessionService.operation.EDIT);
          }
        };
      });

      commentService.refreshFilteredComments($scope.commentFilter);

      $scope.loadComments = function loadComments(): void {
        commentService.loadEntryComments($scope.entry.id).then(() => {
          commentService.refreshFilteredComments($scope.commentFilter);
          if ($scope.commentInteractiveStatus.id) {
            angular.forEach($scope.currentEntryCommentsFiltered, comment => {
              if (comment.id === $scope.commentInteractiveStatus.id) {
                comment.showRepliesContainer = $scope.commentInteractiveStatus.visible;
              }
            });
          }
        });
      };

      $scope.setCommentInteractiveStatus = function setCommentInteractiveStatus(id: string, visible: boolean): void {
        $scope.commentInteractiveStatus.id = id;
        $scope.commentInteractiveStatus.visible = visible;
      };

      $scope.plusOneComment = function plusOneComment(commentId: string): void {
        commentService.plusOne(commentId, result => {
          if (result.ok) {
            $scope.control.editorService.refreshEditorData().then(() => {
              $scope.loadComments();
            });
          }
        });
      };

      $scope.canPlusOneComment = function canPlusOneComment(commentId: string): boolean {
        return !(commentService.comments.counts.userPlusOne != null &&
          commentService.comments.counts.userPlusOne[commentId] != null);
      };

      $scope.getNewCommentPlaceholderText = function getNewCommentPlaceholderText(): string {
        let label;
        if ($scope.currentEntryCommentsFiltered.length === 0) {
          label = 'Your comment goes here.  Be the first to share!';
        } else if ($scope.currentEntryCommentsFiltered.length > 0) {
          if ($scope.newComment != null) {
            label = 'Start a new conversation relating to the ' + $scope.newComment.regarding.fieldNameForDisplay;
          } else {
            label = 'Start a new conversation';
          }
        } else {
          label = 'Join the discussion and type your comment here.';
        }

        return label;
      };

      $scope.showCommentsInContext = function showCommentsInContext(contextGuid: string): void {
        $scope.commentFilter.contextGuid = contextGuid;
        $scope.showNewComment = (contextGuid !== '');

        commentService.refreshFilteredComments($scope.commentFilter);
      };

      $scope.postNewComment = function postNewComment(): void {
        // Get the latest value for the field before saving in case it has changed
        // since the comment panel was first triggered and comment started getting entered
        const contextParts = $scope.control.getContextParts($scope.newComment.contextGuid);
        $scope.newComment.regarding.fieldValue = contextParts.value;
        $scope.posting = true;
        commentService.update($scope.newComment, result => {
          if (result.ok) {
            $scope.control.editorService.refreshEditorData().then(() => {
              const previousComment = $scope.newComment;
              $scope.loadComments();
              $scope.initializeNewComment();
              $scope.newComment.regarding = previousComment.regarding;
              $scope.posting = false;
            });
          }
        });

        commentService.refreshFilteredComments($scope.commentFilter); // for instant feedback
      };

      $scope.getSenseLabel = function getSenseLabel(regardingField: string, contextGuid: string): string {
        if (regardingField == null) {
          return '';
        }

        let index = null;
        if (contextGuid != null) {
          const contextParts = $scope.control.getContextParts(contextGuid);
          if (contextParts.example.index) {
            index = contextParts.example.index;
          } else if (contextParts.sense.index) {
            index = contextParts.sense.index;
          }
        }

        let configField = null;
        const fields = $scope.control.config.entry.fields;
        if (fields.hasOwnProperty(regardingField)) {
          configField = fields[regardingField];
        } else if (fields.senses.fields.hasOwnProperty(regardingField)) {
          configField = fields.senses.fields[regardingField];
        } else if (fields.senses.fields.examples.fields.hasOwnProperty(regardingField)) {
          configField = fields.senses.fields.examples.fields[regardingField];
        }

        if (configField !== null) {
          if (configField.hasOwnProperty('senseLabel')) {
            if (index != null && configField.senseLabel instanceof Array) {
              return configField.senseLabel[index];
            } else {
              return configField.senseLabel;
            }
          }
        }

        return '';
      };

      $scope.getNewCommentSenseLabel = function getNewCommentSenseLabel(regardingField: string): string {
        if (regardingField == null) {
          return '';
        }

        return $scope.getSenseLabel(regardingField, $scope.newComment.contextGuid);
      };

      $scope.$watch('entry', (newVal: LexEntry) => {
        if (newVal && !angular.equals(newVal, {})) {
          $scope.loadComments();
          $scope.initializeNewComment();
        }
      });

      $scope.$watch('commentFilter.text', (newVal: string, oldVal: string) => {
        if (newVal !== oldVal) {
          commentService.refreshFilteredComments($scope.commentFilter);
        }

      });

      $scope.$watch('commentFilter.status', (newVal: string, oldVal: string) => {
        if (newVal !== oldVal) {
          commentService.refreshFilteredComments($scope.commentFilter);
        }

      });

      $scope.$watch('control.commentContext', (newVal: LexComment, oldVal: LexComment) => {
        if (newVal !== oldVal) {
          $scope.showCommentsInContext(newVal.contextGuid);
        }

      }, true);

    }]
  };
}
