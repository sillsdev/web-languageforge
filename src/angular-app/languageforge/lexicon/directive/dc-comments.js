angular.module('palaso.ui.dc.comments', ['palaso.ui.dc.entry', 'angularjs-gravatardirective', 'ngRoute'])
// Palaso UI Dictionary Control: Comments
.directive('dcComments', ['$routeParams', 'lexEntryService', function($routeParams, lexService) {
	return {
		restrict: 'E',
		templateUrl: '/angular-app/languageforge/lexicon/directive/dc-comments.html',
		scope: {
			dcConfig : "=",
			dcModel : "=",
		},
		controller: ['$scope', function($scope) {
			$scope.validStatuses = [ // TODO: Get this list from the appropriate service
				"To Do",
				"Reviewed",
				"Resolved",
			];
			$scope.nextStatus = function(prevStatus) {
				var idx = $scope.validStatuses.indexOf(prevStatus);
				return $scope.validStatuses[(idx+1) % $scope.validStatuses.length]
			};
			$scope.config = angular.copy($scope.dcConfig); // Don't want to make changes to the passed-in config object
			$scope.makeValidModel = function() {
				if (!$scope.dcModel) {
					$scope.dcModel = {};
				}
				if (!$scope.dcModel.comments) {
					$scope.dcModel.comments = [];
					// $scope.dcModel.comments.push($scope.makeValidComment()); // Sample data for debugging
				}
			};

			$scope.makeValidComment = function() {
				// Create and return an empty comment object
				return {
					userRef: {username: "Robin M.", email: "Robin_Munn@sil.org"}, // Sample data. If email provided, will be used in fetching Gravatar
					// TODO: Get actual username & email from session service
					dateModified: new Date(), // Default to today's date, can modify this elsewhere if needed
					regarding: "",
					content: "",
					score: 0,
					subcomments: [],
					status: "To Do",
				};
			};

			$scope.submitComment = function(newCommentContent) {
				var comment = $scope.makeValidComment();
				comment.regarding = $scope.dcModel.value;
				comment.content = newCommentContent;
				$scope.dcModel.comments.push(comment);
			};

			$scope.submitSubcomment = function(newSubcommentContent, parentComment) {
				var subcomment = $scope.makeValidComment();
				subcomment.regarding = parentComment.content; // Not actually used at the moment, but why not? We may want it later
				subcomment.content = newSubcommentContent;
				parentComment.subcomments.push(subcomment);
			}

			// TODO: The correct way to do this, per spec, is to store votes on a per-user basis,
			// then calculate the score by subtracting downvotes from upvotes. This permits us to control
			// ballot stuffing by giving each user only one vote per comment, which can be an upvote
			// or a downvote. We'll need to hook up the session service and get the current username,
			// then store that in either the comment.upvotes or comment.downvotes list. Then the current
			// score will become a function: return comment.upvotes.length - comment.downvotes.length.
			$scope.incScore = function(comment) {
				comment.score++;
			}
			$scope.decScore = function(comment) {
				comment.score--;
			}
		}],
		link: function(scope, element, attrs, controller) {
			scope.$watch('visibility', function() { // Or some other variable instead of visibility... this is just an example
				// Hide me
			});
			scope.$watch('dcModel', function() {
				scope.makeValidModel();
			});
		},
	};
}])
;
