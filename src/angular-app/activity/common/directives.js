'use strict';

angular.module('activity.directives', ['sf.services']).
	directive('activityitem', ['linkService', function(linkService) {
		return {
			restrict : 'E',
			replace : true,
			templateUrl : '/app/activity/partials/activityitem.directive.html',
			template : '',
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
				
				this.updateScope = {
					'global' : {
						'message' : function() {
							$scope.imageurl = '/images/activity/message-icon.png';
						}
					},
					'project' : {
						'add_comment' : function() {
							$scope.imageurl = item.userRef.avatar_ref;
						},
						'update_comment' : function() {
							$scope.imageurl = item.userRef.avatar_ref;
							$scope.questionHref = linkService.question(item.projectRef, item.content.project, item.textRef, item.content.text, item.questionRef, item.content.question);
							$scope.userProfileHref = linkService.user(item.userRef.id);
						},
						'add_answer' : function() {
							$scope.imageurl = item.userRef.avatar_ref;
						},
						'update_answer' : function() {
							$scope.imageurl = item.userRef.avatar_ref;
						},
						'add_text' : function() {
							$scope.imageurl = '/images/activity/add_text-icon.png';
						},
						'add_question' : function() {
							$scope.imageurl = '/images/activity/add_question-icon.png';
						},
						'change_state_of_question' : function() {
							$scope.imageurl = '/images/activity/unknown-icon.png';
						},
						'increase_score' : function() {
							$scope.imageurl = '/images/activity/increase_score-icon.png';
						},
						'decrease_score' : function() {
							$scope.imageurl = '/images/activity/decrease_score-icon.png';
						},
						'add_user_to_project' : function() {
							$scope.imageurl = '/images/activity/add_user_to_project-icon.png';
						}
					}
				};
				
				
			}],
			link : function(scope, element, attrs, controller) {
				scope.$watch('item', function() {
					scope.partialurl = '/app/activity/partials/' + scope.item.action + '-' + scope.item.type + '.html';
					controller.updateScope[scope.item.type][scope.item.action]();
				})
			}
		};
	}]);
