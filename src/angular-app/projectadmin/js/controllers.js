'use strict';

/* Controllers */
var app = angular.module(
		'projectAdmin.controllers',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap' ]
	)
	.controller('UserListCtrl', ['$scope', 'userService', function($scope, userService) {
		$scope.selected = [];
		$scope.updateSelection = function(src, item) {
			var selectedIndex = $scope.selected.indexOf(item);
			var checkbox = src.target;
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
		$scope.queryUsers = function() {
			userService.list(function(result) {
				if (result.ok) {
					$scope.users = result.data.entries;
				}
			});
		};
		
		
		$scope.selectUser = function(item) {
			console.log("Called selectUser(", item, ")");
		};
		
	}])
	.controller('UserSearchCtrl', ['$scope', 'userService', function($scope, userService) {
	    $scope.users = [];
		
		$scope.searchUser = function(term) {
			console.log('searching for ', term);
			userService.typeahead(term, function(result) {
				// TODO Check term == controller view value (cf bootstrap typeahead) else abandon.
				if (result.ok) {
					$scope.users = result.data.entries;
				}
			});
		};
	
		$scope.selectUser = function(item) {
			console.log('user selected', item);
			$scope.term = item.name;
		};
	
		$scope.imageSource = function(avatarRef) {
			return avatarRef ? '/images/avatar/' + avatarRef : '/images/avatar/anonymous02.png';
		};
	
	}])
	;
