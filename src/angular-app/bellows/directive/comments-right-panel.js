"use strict";
angular.module('palaso.ui.comments-right-panel', ['palaso.ui.utils', 'palaso.ui.dc.comment',  'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.comment', 'ngAnimate', 'truncate', 'palaso.ui.scroll', 'palaso.ui.notice', 'pascalprecht.translate'])
// Palaso UI Dictionary Control: Comments

  .directive('currentEntryCommentCount', [function() {
    return {
      restrict: 'E',
      templateUrl: '/angular-app/bellows/directive/current-entry-comment-count.html',
      controller: ['$scope', 'lexCommentService', function($scope, commentService) {
        $scope.count = commentService.comments.counts.currentEntry;
      }],
      link: function(scope, element, attrs, controller) {
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

        $scope.currentEntryCommentsFiltered = [];
        $scope.numberOfComments = commentService.comments.counts.currentEntry.total;
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

        $scope.loadComments = function loadComments() {
          commentService.loadEntryComments($scope.entryId);
          $scope.currentEntryCommentsFiltered = getFilteredComments();
        };
        $scope.updateComment = function updateComment(comment) {
          var comment = $scope.control.getComment(comment);

          commentService.update(comment, function(result) {
            if (result.ok) {
              $scope.control.refreshData(false, function() {
                $scope.loadComments();
              });
            }
          });
        }

        $scope.plusOneComment = function plusOneComment(commentId) {
          commentService.plusOne(commentId, function(result) {
            if (result.ok) {
              $scope.control.refreshData(false, function() {
                $scope.loadComments();
              });
            }
          });
        };

        $scope.canPlusOneComment = function canPlusOneComment(commentId) {
          if (angular.isDefined(commentService.comments.counts.userPlusOne[commentId])) {
            return false;
          }
          return true;
        };

        $scope.getNewCommentPlaceholderText = function getNewCommentPlaceholderText() {
          var label;
          if (commentService.comments.items.currentEntry.length == 0) {
            label = $filter('translate')("Your comment goes here.  Be the first to share!");
          } else if (commentService.comments.items.currentEntry.length < 3) {
            label = $filter('translate')("Start a conversation.  Enter your comment here.");
          } else {
            label = $filter('translate')("Join the discussion and type your comment here.");
          }
          return label;
        };



        $scope.$watch('entryId', function(newVal, oldVal) {
          if (newVal) {
            $scope.loadComments();
          }
        });





        function getFilteredComments() {
          var comments = $filter('filter')(commentService.comments.items.currentEntry, $scope.commentFilter.byText);
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
          _deleteCommentInList(commentId, replyId, commentServicecomments.all);
          _deleteCommentInList(commentId, replyId, commentService.comments.items.currentEntry);
        }


      }],
      link: function(scope, element, attrs, controller) {
      }
    };
  }])
;
