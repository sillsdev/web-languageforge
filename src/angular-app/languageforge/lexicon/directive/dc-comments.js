angular.module('palaso.ui.dc.comments', ['angularjs-gravatardirective'])
// Palaso UI Dictionary Control: Comments
.directive('dcComments', [function() {
	return {
		restrict: 'E',
		templateUrl: '/angular-app/languageforge/lexicon/directive/dc-comments.html',
		scope: {
			config : "=",
			model : "=",
			submitComment : "&submit"
		},
		controller: ['$scope', function($scope) {
			$scope.validStatuses = [ // TODO: Get this list from the appropriate service
				"To Do",
				"Reviewed",
				"Resolved",
			];
			$scope.nextStatus = function(prevStatus) {
				var idx = $scope.validStatuses.indexOf(prevStatus);
				return $scope.validStatuses[(idx+1) % $scope.validStatuses.length];
			};
			$scope.config = angular.copy($scope.config); // Don't want to make changes to the passed-in config object
			$scope.makeValidModel = function() {
				if (!$scope.model) {
					$scope.model = {};
				}
				if (!$scope.model.comments) {
					$scope.model.comments = [];
					// $scope.model.comments.push($scope.makeValidComment()); // Sample data for debugging
				}
			};

			/*
			$scope.makeValidComment = function() {
				// Create and return an empty comment object
				return {
					//userRef: {username: "Robin M.", email: "Robin_Munn@sil.org"}, // Sample data. If email provided, will be used in fetching Gravatar
					// TODO: Get actual username & email from session service
					//dateModified: new Date(), // Default to today's date, can modify this elsewhere if needed
					regarding: "",
					content: "",
					score: 0,
					replies: [],
					status: "To Do",
				};
			};
			*/
			

			$scope.doComment = function(newCommentContent) {
				if (angular.isDefined(newCommentContent) && newCommentContent != '') {
					var comment = {};
					comment.regarding = $scope.model.value;
					comment.content = newCommentContent;
					$scope.newComment = '';
					$scope.submitComment({comment:comment});
				}
			};
			
			$scope.doReply = function(newReplyContent, parentComment) {
				var reply = {};
				//reply.regarding = parentComment.content; // Not actually used at the moment, but why not? We may want it later
				reply.content = newReplyContent;
				reply.parentId = parentComment.id;
				$scope.submitComment({comment:reply});
			};

			// TODO: The correct way to do this, per spec, is to store votes on a per-user basis,
			// then calculate the score by subtracting downvotes from upvotes. This permits us to control
			// ballot stuffing by giving each user only one vote per comment, which can be an upvote
			// or a downvote. We'll need to hook up the session service and get the current username,
			// then store that in either the comment.upvotes or comment.downvotes list. Then the current
			// score will become a function: return comment.upvotes.length - comment.downvotes.length.
			$scope.incScore = function(comment) {
				comment.score++;
			};
			$scope.decScore = function(comment) {
				comment.score--;
			};
		}],
		link: function(scope, element, attrs, controller) {
			scope.$watch('visibility', function() { // Or some other variable instead of visibility... this is just an example
				// Hide me
			});
			scope.$watch('model', function() {
				scope.makeValidModel();
			});
		},
	};
}])
;
