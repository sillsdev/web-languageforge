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
					content: "This is the sample comment",
					score: 0,
					subcomments: [],
					status: "To Do",
				};
			};

			$scope.submitComment = function(newCommentContent) {
				var comment = $scope.makeValidComment();
				comment.dateModified = new Date(); // Duplicate of code in makeValidComment(); decide later which one to use
				comment.regarding = $scope.dcModel.value;
				comment.content = newCommentContent;
				// comment.subcomments.push($scope.makeValidComment());
				$scope.dcModel.comments.push(comment);
			};

			$scope.submitSubcomment = function(newSubcommentContent, parentComment) {
				var subcomment = $scope.makeValidComment();
				subcomment.dateModified = new Date(); // Duplicate of code in makeValidComment(); decide later which one to use
				subcomment.regarding = parentComment.content; // We're inside the ng-repeat="comment in ngModel.comments" scope here
				subcomment.content = newSubcommentContent;
				subcomment.subcomments.push($scope.makeValidComment());
				parentComment.subcomments.push(subcomment);
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
