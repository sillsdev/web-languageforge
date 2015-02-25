"use strict";
angular.module('palaso.ui.comments-right-panel', ['palaso.ui.utils', 'palaso.ui.dc.comment', 'lexicon.services',  'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.comment', 'ngAnimate', 'truncate', 'lexicon.services', 'palaso.ui.scroll', 'palaso.ui.notice'])
// Palaso UI Dictionary Control: Comments
.directive('commentsRightPanel', [function() {
	return {
		restrict: 'E',
		templateUrl: '/angular-app/bellows/directive/comments-right-panel.html',
		scope: {
			model : "=",
			control: "="
		},
		controller: ['$scope', '$filter', 'lexCommentService', '$translate', function($scope, $filter, commentService) {
			var commentService = commentService;
			

			  $scope.currentEntryComments = [];
			  $scope.commentsUserPlusOne = [];
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
			  
			loadEntryComments();
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
			
			$scope.updateReply = function updateReply(commentId, reply) {
				commentService.updateReply(commentId, reply, function(result) {
			      if (result.ok) {
			    	  $scope.control.refreshData(false, function() {
			    		  loadEntryComments();
				      });
			      }
			    });
			  };
			  

			  $scope.deleteComment = function deleteComment(comment) {
			    var deletemsg;
			    if (sessionService.session.userId == comment.authorInfo.createdByUserRef.id) {
			      deletemsg = "Are you sure you want to delete your own comment?";
			    } else {
			      deletemsg = "Are you sure you want to delete " + comment.authorInfo.createdByUserRef.name + "'s comment?";
			    }

			    modal.showModalSimple('Delete Comment', deletemsg, 'Cancel', 'Delete Comment').then(function() {
			      commentService.remove(comment.id, function(result) {
			        if (result.ok) {
			          $scope.control.refreshData(false, function() {
			            loadEntryComments();
			          });
			        }
			      });
			      removeCommentFromLists(comment.id);
			    });
			  };

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
			    if (angular.isDefined($scope.commentsUserPlusOne[commentId])) {
			      return false;
			    }
			    return true;
			  };

			  $scope.deleteCommentReply = function deleteCommentReply(commentId, reply) {
			    var deletemsg;
			    if (sessionService.session.userId == reply.authorInfo.createdByUserRef.id) {
			      deletemsg = "Are you sure you want to delete your own comment reply?";
			    } else {
			      deletemsg = "Are you sure you want to delete " + reply.authorInfo.createdByUserRef.name + "'s comment reply?";
			    }

			    modal.showModalSimple('Delete Reply', deletemsg, 'Cancel', 'Delete Reply').then(function() {
			      commentService.deleteReply(commentId, reply.id, function(result) {
			        if (result.ok) {
			          $scope.control.refreshData(false, function() {
			            loadEntryComments();
			          });
			        }
			      });
			      removeCommentFromLists(commentId, reply.id);
			    });
			  };

			  $scope.updateCommentStatus = function updateCommentStatus(commentId, status) {
			    commentService.updateStatus(commentId, status, function(result) {
			      if (result.ok) {
			        $scope.control.refreshData(false, function() {
			          loadEntryComments();
			        });
			      }
			    });
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
			  

			  function loadEntryComments() {
			    var comments = [];
			    var count = {
			      total: 0,
			      fields: {}
			    };
			    var entryCommentsCounts = {};
			    for (var i = 0; i < $scope.model.length; i++) {
			      var comment = $scope.model[i];

			      // add counts to global entry comment counts
			      if (angular.isUndefined(entryCommentsCounts[comment.entryRef])) {
			        entryCommentsCounts[comment.entryRef] = 0;
			      }
			      if (comment.status != 'resolved') {
			        entryCommentsCounts[comment.entryRef]++;
			      }

			      var fieldName = comment.regarding.field;
			      if (comment.entryRef == $scope.control.currentEntry.id) {
			        if (fieldName && angular.isUndefined(count.fields[fieldName])) {
			          count.fields[fieldName] = 0;
			        }

			        // add comment to the correct 'field' container
			        comments.push(comment);

			        // update the appropriate count for this field and update the total count
			        if (comment.status != 'resolved') {
			          if (fieldName) {
			            count.fields[fieldName]++;
			          }
			          count.total++;
			        }
			      }
			    }
			    $scope.currentEntryComments = comments;
			    $scope.currentEntryCommentsFiltered = getFilteredComments();
			    $scope.control.currentEntryCommentCounts = count;
			    $scope.control.entryCommentCounts = entryCommentsCounts;
			  }

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
			    _deleteCommentInList(commentId, replyId, $scope.control.comments);
			    _deleteCommentInList(commentId, replyId, $scope.currentEntryComments);
			  }


		}],
		link: function(scope, element, attrs, controller) {
		}
	};
}])
;
