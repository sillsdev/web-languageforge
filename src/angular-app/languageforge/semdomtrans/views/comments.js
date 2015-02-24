'use strict';

angular.module('semdomtrans.comments', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.scroll', 'palaso.ui.dc.comment', 'palaso.ui.comments-right-panel', 'lexicon.services'])
// DBE controller
.controller('commentsCtrl', ['$scope', '$stateParams', 'lexCommentService',  'sessionService', 'modalService', 'silNoticeService', 
function($scope, $stateParams, comms, sessionService, modal, notice) {
	var commentService = comms;
	$scope.$parent.itemIndex = $stateParams.position;
	$scope.control = $scope;
	$scope.newComment = {
		id: '',
		content: '',
		entryRef: '',
		regarding: {
			'field': '',
			'fieldValue': ''
		}
	}
	
	 if ($scope.items.length == 0 && !$scope.loadingDto) {
    	$scope.refreshData(true);
    } 
	
	$scope.currentEntryCommentsFiltered = [];
	
	for (var i = 0; i < $scope.$parent.comments.length; i++) {
		if ($scope.currentItem.id == $scope.$parent.comments[i].entryRef) {
			$scope.currentEntryCommentsFiltered.push($scope.$parent.comments[i]);
		}
	}
	

	$scope.setSelectedField = function setSelectedField(fieldName, model) {
		$scope.newComment.regarding.field = fieldName;
		$scope.newComment.regarding.fieldNameForDisplay = fieldName;
		$scope.newComment.regarding.fieldValue = model.source + "#" + model.source;	
		$scope.newComment.entryRef = $scope.$parent.currentItem.id;
	}
	  
	  $scope.getComment = function getComment(comment) {
		  comment = $scope.newComment;
		  // TODO - check if it is a new comment
		  isNewComment = true;
		  if (isNewComment) { // reset newComment
	          $scope.control.newComment = {
	            id: '',
	            content: '',
	            regarding: {}
	          }; // model for new comment content
		  }
		  return comment;
	  }
	  
	  $scope.getNewCommentPlaceholderText = function getNewCommentPlaceholderText() {
		  return "Join the conversation, enter a comment here";
	  }
	  
	  $scope.loadEntryComments = function loadEntryComments() {
	    	 ;
	  }
	  
	  $scope.refreshData = function refreshData(state) {
          $scope.$parent.refreshData(state, function() {
        	  $scope.loadEntryComments();
          	});	
      }

  
	
	// permissions stuff
	  $scope.rights = {
	    canEditProject: function canEditProject() {
	      return sessionService.hasProjectRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
	    },
	    canEditEntry: function canEditEntry() {
	      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.EDIT);
	    },
	    canDeleteEntry: function canDeleteEntry() {
	      return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.DELETE);
	    },
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
}]);
