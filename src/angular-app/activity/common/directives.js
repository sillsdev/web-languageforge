'use strict';

angular.module('activity.directives', []).
	directive('activityitem', [function() {
		return {
			restrict : 'E',
			replace : true,
			template : '<hr /> <div class="span2"> <img src="{{imageurl}}" /> </div> <div class="span2"> {{datestring|dateformat}} </div> <div class="span8"> {{content}} </div>',
			scope : {
				item: "="
			},
			controller: ["$scope", function($scope) {
				this.updateItem = function() {
					var content = '';
					var type = $scope.item.type;
					$scope.content = this.content[$scope.item.type][$scope.item.action]($scope.item);
					$scope.imageurl = this.imageurl[$scope.item.type][$scope.item.action]($scope.item);
				};
				
				this.updateItem = {
					'global' : {
						'message' : function(item) {
							$scope.imageurl = '/images/activity/message-icon.png';
							$scope.content = item.content.message;
						}
					},
					'project' : {
						'add_comment' : function(item) {
							$scope.imageurl = '/images/activity/message-icon.png';
							$scope.content = item.content.message;
						},
						'update_comment' : function(item) {
							$scope.imageurl = item.userRef.avatar_ref;
							var content = '';
							content += item.userRef.username + " commented on " +
								item.userRef2.username + "'s answer to \"<a href='"  + 
								+ + item.content.question +
								""
							$scope.content = content;
						},
						'add_answer' : function(item) {
						},
						'update_answer' : function(item) {
						},
						'add_text' : function(item) {
						},
						'add_question' : function(item) {
						},
						'change_state_of_question' : function(item) {
						},
						'increase_score' : function(item) {
						},
						'decrease_score' : function(item) {
						},
						'add_user_to_project' : function(item) {
						}
					}
				};
				
				
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('item', function() {
					scope.datestring = scope.item.date;
					controller.updateItem[scope.item.type][scope.item.action](scope.item);
				})
			}
		};
	}]);
