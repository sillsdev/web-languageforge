'use strict';

/* Controllers */
var app = angular.module(
		'projectAdmin',
		[ 'jsonRpc', 'projectAdmin.directives', 'projectAdmin.services', 'sf.services', 'palaso.ui', 'ui.bootstrap' ]
	)
	.controller('UserListCtrl', ['$scope', 'userService', function($scope, userService) {
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
