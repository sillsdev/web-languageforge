"use strict";
angular.module('palaso.ui.comments-right-panel', ['palaso.ui.utils', 'palaso.ui.dc.comment',  'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.comment', 'ngAnimate', 'truncate', 'palaso.ui.scroll', 'palaso.ui.notice', 'pascalprecht.translate'])
// Palaso UI Dictionary Control: Comments

  .directive('currentEntryCommentCount', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/current-entry-comment-count.html',
      require: 'commentsRightPanel',
      link: function(scope, element, attrs, commentsRightPanelController) {
        scope.count = commentsRightPanelController.currentEntryCommentCounts;
      }
    };
  }])

  .directive('commentsRightPanel', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/comments-right-panel.html',
      scope: {
        entryId: "=",
        control: "="
      },
      controller: ['$scope', '$filter', 'lexCommentService', 'sessionService', 'modalService', function($scope, $filter, commentService, sessionService, modal) {
        $scope.currentEntryComments = [];
        $scope.currentEntryCommentCounts = { total: 0, fields: {}};

        // publish as an API on the controller
        this.currentEntryCommentCounts = $scope.currentEntryCommentCounts;

        $scope.currentEntryCommentsFiltered = [];
        $scope.commentFilter = {
          text: '',
          status: 'all',
          byText: function byText(comment) {
            // Convert entire comment object to a big string and search for filter.
            // Note: This has a slight side effect of ID and avatar information
            // matching the filter.
            if (JSON.stringify(comment).toLowerCase().indexOf($scope.commentFilter.text.toLowerCase()) != -1) {
              return true;
            }
            return false;
          },
          byStatus: function byStatus(comment) {
            if (angular.isDefined(comment)) {
              if ($scope.commentFilter.status == 'all') {
                return true;
              } else if ($scope.commentFilter.status == 'todo') {
                if (comment.status == 'todo') {
                  return true;
                }
              } else { // show unresolved comments
                if (comment.status != 'resolved') {
                  return true;
                }
              }
            }
            return false;
          }
        };

        $scope.rights = {
          canComment: function canComment() {
            return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE);
          },
          canDeleteComment: function canDeleteComment(commentAuthorId) {
            if (sessionService.session.userId == commentAuthorId) {
              return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE_OWN);
            } else {
              return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE);
            }
          },
          canEditComment: function canEditComment(commentAuthorId) {
            if (sessionService.session.userId == commentAuthorId) {
              return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT_OWN);
            } else {
              return false;
            }
          },
          canUpdateCommentStatus: function canUpdateCommentStatus() {
            return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT);
          }
        };

        $scope.currentEntryCommentsFiltered = getFilteredComments();
        $scope.updateComment = function updateComment(comment) {
          var comment = $scope.control.getComment(comment);

          commentService.update(comment, function(result) {
            if (result.ok) {
              $scope.control.refreshData(false, function() {
                loadEntryComments();
              });
            }
          });
        }

        $scope.plusOneComment = function plusOneComment(commentId) {
          commentService.plusOne(commentId, function(result) {
            if (result.ok) {
              $scope.control.refreshData(false, function() {
                loadEntryComments();
              });
            }
          });
        };

        $scope.canPlusOneComment = function canPlusOneComment(commentId) {
          if (angular.isDefined(commentService.commentsUserPlusOne[commentId])) {
            return false;
          }
          return true;
        };

        $scope.getNewCommentPlaceholderText = function getNewCommentPlaceholderText() {
          var label;
          if ($scope.currentEntryComments.length == 0) {
            label = $filter('translate')("Your comment goes here.  Be the first to share!");
          } else if ($scope.currentEntryComments.length < 3) {
            label = $filter('translate')("Start a conversation.  Enter your comment here.");
          } else {
            label = $filter('translate')("Join the discussion and type your comment here.");
          }
          return label;
        };


        /**
         * This should be called whenever the entry context changes (to update the comments and comment counts)
         * @param allComments
         * @param currentEntryId
         */
        function loadEntryComments() {
          for (var i = 0; i < commentService.allComments.length; i++) {
            var comment = commentService.allComments[i];
            var fieldName = comment.regarding.field;
            if (comment.entryRef == $scope.entryId) {
              if (fieldName && angular.isUndefined($scope.currentEntryCommentCounts.fields[fieldName])) {
                $scope.currentEntryCommentCounts.fields[fieldName] = 0;
              }
              $scope.currentEntryComments.push(comment);

              // update the appropriate count for this field and update the total count
              if (comment.status != 'resolved') {
                if (fieldName) {
                  $scope.currentEntryCommentCounts.fields[fieldName]++;
                }
                $scope.currentEntryCommentCounts.total++;
              }
            }
          }
        };

        $scope.$watch('entryId', function(newVal, oldVal) {
          if (newVal) {
            loadEntryComments();
            $scope.currentEntryCommentsFiltered = getFilteredComments();
          }
        });



        /*
         * currentEntryCommentCounts has the following structure: { 'total': int total
         * count 'fields': { 'lexeme': int count of comments for lexeme field,
         * 'definition': int count of comments for definition field, } }
         */
        this.getFieldCommentCount = function getFieldCommentCount(fieldName) {
          if (angular.isDefined($scope.currentEntryCommentCounts.fields[fieldName])) {
            return $scope.currentEntryCommentCounts.fields[fieldName];
          }
          return 0;
        };

        this.getEntryCommentCount = function getEntryCommentCount(entryId) {
          if (angular.isDefined($scope.entryCommentCounts[entryId])) {
            return $scope.entryCommentCounts[entryId];
          }
          return 0;
        };


        function getFilteredComments() {
          var comments = $filter('filter')($scope.currentEntryComments, $scope.commentFilter.byText);
          return $filter('filter')(comments, $scope.commentFilter.byStatus);
        }

        $scope.$watch('commentFilter.text', function(newVal, oldVal) {
          if (newVal != oldVal) {
            $scope.currentEntryCommentsFiltered = getFilteredComments();
          }

        });

        $scope.$watch('commentFilter.status', function(newVal, oldVal) {
          if (newVal != oldVal) {
            $scope.currentEntryCommentsFiltered = getFilteredComments();
          }

        });



        function _deleteCommentInList(commentId, replyId, list) {
          var deleteComment = true;
          if (angular.isDefined(replyId)) {
            deleteComment = false;
          }
          for (var i = list.length - 1; i >= 0; i--) {
            var c = list[i];
            if (deleteComment) {
              if (c.id == commentId) {
                list.splice(i, 1);
              }
            } else {

              // delete Reply
              for (var j = c.replies.length - 1; j >= 0; j--) {
                var r = c.replies[j];
                if (r.id == replyId) {
                  c.replies.splice(j, 1);
                }
              }
            }
          }
        }

        function removeCommentFromLists(commentId, replyId) {
          _deleteCommentInList(commentId, replyId, commentService.allComments);
          _deleteCommentInList(commentId, replyId, commentService.currentEntryComments);
        }


      }],
      link: function(scope, element, attrs, controller) {
      }
    };
  }])
;
