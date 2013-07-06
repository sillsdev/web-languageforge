'use strict';

function projectIdFromLocation(location) {
	var url = location.absUrl();
	var slashIndex = url.lastIndexOf('/');
	return url.substr(slashIndex + 1);
}

/* Controllers */
var app = angular.module(
		'sfchecks.controllers',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('MainCtrl', ['$scope', '$route', '$routeParams', '$location', function($scope, $route, $routeParams, $location) {
		$scope.route = $route;
		$scope.location = $location;
		$scope.routeParams = $routeParams;
	}])
	.controller('ProjectsCtrl', ['$scope', 'projectService', function($scope, projectService) {
		$scope.selected = [];
		$scope.updateSelection = function(event, item) {
			var selectedIndex = $scope.selected.indexOf(item);
			var checkbox = event.target;
			if (checkbox.checked && selectedIndex == -1) {
				$scope.selected.push(item);
			} else if (!checkbox.checked && selectedIndex != -1) {
				$scope.selected.splice(selectedIndex, 1);
			}
		};
		$scope.isSelected = function(item) {
			return item != null && $scope.selected.indexOf(item) >= 0;
		};
		
		$scope.users = [];
		$scope.queryUserProjects = function() {
			projectService.list(function(result) {
				if (result.ok) {
					$scope.projects = result.data.entries;
					$scope.projectCount = result.data.count;
				}
			});
		};
		
		$scope.removeProjectUsers = function() {
			console.log("removeUsers");
			var userIds = [];
			for(var i = 0, l = $scope.selected.length; i < l; i++) {
				userIds.push($scope.selected[i].id);
			}
			if (l == 0) {
				// TODO ERROR
				return;
			}
			projectService.removeUsers($scope.projectId, userIds, function(result) {
				if (result.ok) {
					$scope.queryProjectUsers();
					// TODO
				}
			});
		};
		
		$scope.selectUser = function(item) {
			console.log("Called selectUser(", item, ")");
		};
		
	
	
		$scope.selectUser = function(item) {
			console.log('user selected', item);
			$scope.user = item;
			$scope.term = item.name;
		};
	
		$scope.imageSource = function(avatarRef) {
			return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
		};
	
	}])
	.controller('ProjectCtrl', ['$scope', 'projectService', function($scope, projectService) {
	}])
	.controller('QuestionsCtrl', ['$scope', 'projectService', function($scope, projectService) {
	}])
	.controller('QuestionCtrl', ['$scope', 'projectService', function($scope, projectService) {
	}])
	;
