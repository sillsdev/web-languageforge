"use strict";
angular.module('palaso.ui.comments-right-panel', ['palaso.ui.utils', 'palaso.ui.dc.comment', 'lexicon.services'])
// Palaso UI Dictionary Control: Comments
.directive('commentsRightPanel', [function() {
	return {
		restrict: 'E',
		templateUrl: '/angular-app/bellows/directive/comments-right-panel.html',
		scope: {
			model : "=",
			control: "="
		},
		controller: ['$scope', 'lexCommentService', function($scope, commentService) {
			var commentService = commentService;

			 $scope.updateComment = function updateComment(comment) {
				var comment = $scope.control.getComment(comment);

			    commentService.update(comment, function(result) {
			      if (result.ok) {
			    	  $scope.control.refreshData(false, function() {
			    		  $scope.control.loadEntryComments();
				      });
			      }
			    });
			  }
			
			$scope.updateReply = function updateReply(commentId, reply) {
				commentService.updateReply(commentId, reply, function(result) {
			      if (result.ok) {
			    	  $scope.control.refreshData(false, function() {
			    		  $scope.control.loadEntryComments();
				      });
			      }
			    });
			  };

		}],
		link: function(scope, element, attrs, controller) {
		}
	};
}])
;
