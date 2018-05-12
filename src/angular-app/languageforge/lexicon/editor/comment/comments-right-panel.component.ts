'use strict';
angular.module('lexCommentsModule')

  // Palaso UI Dictionary Control: Comments
  .directive('commentsRightPanel', [function () {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/languageforge/lexicon/editor/comment/comments-right-panel.component.html',
      scope: {
        entry: '=',
        control: '=',
        newComment: '='
      },
      controller: ['$scope', '$filter', 'lexCommentService', 'sessionService',
      function ($scope, $filter, commentService, sessionService) {

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

        $scope.initializeNewComment = function initializeNewComment() {
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

        $scope.numberOfComments = function numberOfComments() {
          return commentService.comments.counts.currentEntry.total;
        };

        $scope.commentFilter = {
          text: '',
          status: 'all',
          contextGuid: '',
          byText: function byText(comment) {
            // Convert entire comment object to a big string and search for filter.
            // Note: This has a slight side effect of ID and avatar information
            // matching the filter.
            return (JSON.stringify(comment).normalize().toLowerCase()
              .indexOf($scope.commentFilter.text.normalize().toLowerCase()) !== -1);
          },

          byStatus: function byStatus(comment) {
            if (angular.isDefined(comment)) {
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

          byContext: function byContext(comment) {
            if (!angular.isDefined(comment)) {
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

        sessionService.getSession().then(function (session) {
          $scope.rights = {
            canComment: function canComment() {
              if (session.project().isArchived) return false;
              return session.hasProjectRight(sessionService.domain.COMMENTS,
                sessionService.operation.CREATE);
            },

            canDeleteComment: function canDeleteComment(commentAuthorId) {
              if (session.project().isArchived) return false;
              if (session.userId() === commentAuthorId) {
                return session.hasProjectRight(sessionService.domain.COMMENTS,
                  sessionService.operation.DELETE_OWN);
              } else {
                return session.hasProjectRight(sessionService.domain.COMMENTS,
                  sessionService.operation.DELETE);
              }
            },

            canEditComment: function canEditComment(commentAuthorId) {
              if (session.project().isArchived) return false;
              if (session.userId() === commentAuthorId) {
                return session.hasProjectRight(sessionService.domain.COMMENTS,
                  sessionService.operation.EDIT_OWN);
              } else {
                return false;
              }
            },

            canUpdateCommentStatus: function canUpdateCommentStatus() {
              if (session.project().isArchived) return false;
              return session.hasProjectRight(sessionService.domain.COMMENTS,
                sessionService.operation.EDIT);
            }
          };
        });

        commentService.refreshFilteredComments($scope.commentFilter);

        $scope.loadComments = function loadComments() {
          commentService.loadEntryComments($scope.entry.id).then(function () {
            commentService.refreshFilteredComments($scope.commentFilter);
            if ($scope.commentInteractiveStatus.id) {
              angular.forEach($scope.currentEntryCommentsFiltered, function (comment) {
                if (comment.id === $scope.commentInteractiveStatus.id) {
                  comment.showRepliesContainer = $scope.commentInteractiveStatus.visible;
                }
              });
            }
          });
        };

        $scope.setCommentInteractiveStatus = function setCommentInteractiveStatus(id, visible) {
          $scope.commentInteractiveStatus.id = id;
          $scope.commentInteractiveStatus.visible = visible;
        };

        $scope.plusOneComment = function plusOneComment(commentId) {
          commentService.plusOne(commentId, function (result) {
            if (result.ok) {
              $scope.control.editorService.refreshEditorData().then(function () {
                $scope.loadComments();
              });
            }
          });
        };

        $scope.canPlusOneComment = function canPlusOneComment(commentId) {
          return !(angular.isDefined(commentService.comments.counts.userPlusOne) &&
              angular.isDefined(commentService.comments.counts.userPlusOne[commentId]));
        };

        $scope.getNewCommentPlaceholderText = function getNewCommentPlaceholderText() {
          var label;
          if ($scope.currentEntryCommentsFiltered.length === 0) {
            label = $filter('translate')('Your comment goes here.  Be the first to share!');
          } else if ($scope.currentEntryCommentsFiltered.length > 0) {
            if (angular.isDefined($scope.newComment)) {
              label = $filter('translate')('Start a new conversation relating to the ' +
                $scope.newComment.regarding.fieldNameForDisplay);
            } else {
              label = $filter('translate')('Start a new conversation');
            }
          } else {
            label = $filter('translate')('Join the discussion and type your comment here.');
          }

          return label;
        };

        $scope.showCommentsInContext = function showCommentsInContext(contextGuid) {
          $scope.commentFilter.contextGuid = contextGuid;
          $scope.showNewComment = (contextGuid !== '');

          commentService.refreshFilteredComments($scope.commentFilter);
        };

        $scope.postNewComment = function postNewComment() {
          // Get the latest value for the field before saving in case it has changed
          // since the comment panel was first triggered and comment started getting entered
          var contextParts = $scope.control.getContextParts($scope.newComment.contextGuid);
          $scope.newComment.regarding.fieldValue = contextParts.value;
          $scope.posting = true;
          commentService.update($scope.newComment, function (result) {
            if (result.ok) {
              $scope.control.editorService.refreshEditorData().then(function () {
                var previousComment = $scope.newComment;
                $scope.loadComments();
                $scope.initializeNewComment();
                $scope.newComment.regarding = previousComment.regarding;
                $scope.posting = false;
              });
            }
          });

          commentService.refreshFilteredComments($scope.commentFilter); // for instant feedback
        };

        $scope.getSenseLabel = function getSenseLabel(regardingField, contextGuid) {
          if (!angular.isDefined(regardingField)) {
            return '';
          }

          var index = null;
          if (angular.isDefined(contextGuid)) {
            var contextParts = $scope.control.getContextParts(contextGuid);
            if (contextParts.example.index) {
              index = contextParts.example.index;
            } else if (contextParts.sense.index) {
              index = contextParts.sense.index;
            }
          }

          var configField = null;
          var fields = $scope.control.config.entry.fields;
          if (fields.hasOwnProperty(regardingField)) {
            configField = fields[regardingField];
          } else if (fields.senses.fields.hasOwnProperty(regardingField)) {
            configField = fields.senses.fields[regardingField];
          } else if (fields.senses.fields.examples.fields.hasOwnProperty(regardingField)) {
            configField = fields.senses.fields.examples.fields[regardingField];
          }

          if (configField !== null) {
            if (configField.hasOwnProperty('senseLabel')) {
              if (angular.isDefined(index) && configField.senseLabel instanceof Array) {
                return configField.senseLabel[index];
              } else {
                return configField.senseLabel;
              }
            }
          }

          return '';
        };

        $scope.getNewCommentSenseLabel = function getNewCommentSenseLabel(regardingField) {
          if (!angular.isDefined(regardingField)) {
            return '';
          }

          return $scope.getSenseLabel(regardingField, $scope.newComment.contextGuid);
        };

        $scope.$watch('entry', function (newVal) {
          if (newVal && !angular.equals(newVal, {})) {
            $scope.loadComments();
            $scope.initializeNewComment();
          }
        });

        $scope.$watch('commentFilter.text', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            commentService.refreshFilteredComments($scope.commentFilter);
          }

        });

        $scope.$watch('commentFilter.status', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            commentService.refreshFilteredComments($scope.commentFilter);
          }

        });

        $scope.$watch('control.commentContext', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.showCommentsInContext(newVal.contextGuid);
          }

        }, true);

      }],

      link: function (scope, element, attrs, controller) {
      }
    };
  }])

;
