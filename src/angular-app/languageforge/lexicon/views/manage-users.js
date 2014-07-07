'use strict';

angular.module('lexicon.manage-users', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop'])
.controller('manageUsersCtrl', ['$scope', 'userService', 'projectService', 'silNoticeService', 'lexProjectService', '$filter',
                                function($scope, userService, projectService, notice, lexProjectService, $filter) {

	$scope.queryProjectUsers = function() {
		lexProjectService.users(function(result) {
			if (result.ok) {
				$scope.list.users = result.data.users;
				$scope.list.userCount = result.data.userCount;
			}
		});
	};
	
	// ----------------------------------------------------------
	// List
	// ----------------------------------------------------------
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
	
	$scope.removeProjectUsers = function() {
		var userIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			userIds.push($scope.selected[i].id);
		}
		if (l == 0) {
			// TODO ERROR
			return;
		}
		projectService.removeUsers(userIds, function(result) {
			if (result.ok) {
				$scope.queryProjectUsers();
				$scope.selected = [];
				if (userIds.length == 1) {
					notice.push(notice.SUCCESS, $filter('translate')("The user was removed from this project"));
				} else {
					notice.push(notice.SUCCESS, $filter('translate')("{numOfUsers} users were removed from this project", {numOfUsers: userIds.length}));
				}
			}
		});
	};
	
	// Roles in list
	$scope.roles = [
		{key: 'contributor', name: $filter('translate')('Contributor')},
		{key: 'project_manager', name: $filter('translate')('Manager')}
	];
	
	$scope.onRoleChange = function(user) {
		projectService.updateUserRole(user.id, user.role, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, $filter('translate')("{userName}'s role was changed to {role}", {userName: user.username, role: user.role}));
			}
		});
	};
	
	// ----------------------------------------------------------
	// Typeahead
	// ----------------------------------------------------------
	$scope.users = [];
	$scope.addModes = {
		'addNew': { 'en': $filter('translate')('Create New User'), 'icon': 'icon-user'},
		'addExisting' : { 'en': $filter('translate')('Add Existing User'), 'icon': 'icon-user'},
		'invite': { 'en': $filter('translate')('Send Email Invite'), 'icon': 'icon-envelope'}
	};
	$scope.addMode = 'addNew';
	$scope.typeahead = {};
	$scope.typeahead.userName = '';
	
	$scope.queryUser = function(userName) {
		userService.typeahead(userName, function(result) {
			// TODO Check userName == controller view value (cf bootstrap typeahead) else abandon.
			if (result.ok) {
				$scope.users = result.data.entries;
				$scope.updateAddMode();
			}
		});
	};
	$scope.addModeText = function(addMode) {
		return $scope.addModes[addMode].en;
	};
	$scope.addModeIcon = function(addMode) {
		return $scope.addModes[addMode].icon;
	};
	$scope.updateAddMode = function(newMode) {
		if (newMode in $scope.addModes) {
			$scope.addMode = newMode;
		} else {
			// This also covers the case where newMode is undefined
			$scope.calculateAddMode();
		}
	};
	
	$scope.calculateAddMode = function() {
		// TODO This isn't adequate.  Need to watch the 'typeahead.userName' and 'selection' also. CP 2013-07
		if ($scope.typeahead.userName.indexOf('@') != -1) {
			$scope.addMode = 'invite';
		} else if ($scope.users.length == 0) {
			$scope.addMode = 'addNew';
		} else if (!$scope.typeahead.userName) {
			$scope.addMode = 'addNew';
		} else {
			$scope.addMode = 'addExisting';
		}
	};
	
	$scope.addProjectUser = function() {
		if ($scope.addMode == 'addNew') {
			userService.createSimple($scope.typeahead.userName, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, $filter('translate')("User created.  Username: {userName}    Password: {password}", {userName: $scope.typeahead.userName, password: result.data.password}));
					$scope.queryProjectUsers();
				};
			});
		} else if ($scope.addMode == 'addExisting') {
			var model = {};
			model.id = $scope.user.id;
			// Check existing users to see if we're adding someone that already exists in the project
			projectService.users(function(result) {
				if (result.ok) {
					for (var i=0, l=result.data.users.length; i<l; i++) {
						// This approach works, but is unnecessarily slow. We should have an "is user in project?" API,
						// rather than returning all users then searching through them in O(N) time.
						// TODO: Make an "is user in project?" query API. 2014-06 RM
						var thisUser = result.data.users[i];
						if (thisUser.id == model.id) {
							notice.push(notice.WARN, $filter('translate')("'{userName}' is already a member of {projectName}.", {userName: $scope.user.name, projectName: $scope.project.projectName}));
							return;
						}
					}
					projectService.updateUserRole($scope.user.id, 'contributor', function(result) {
						if (result.ok) {
							notice.push(notice.SUCCESS, $filter('translate')("{userName} was added to {projectName} successfully.", {userName: $scope.user.name, projectName: $scope.project.projectName}));
							$scope.queryProjectUsers();
						}
					});
				}
			});
		} else if ($scope.addMode == 'invite') {
			userService.sendInvite($scope.typeahead.userName, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, $filter('translate')("{userName} was invited to join the project {projectName}", {userName: $scope.typeahead.userName, projectName: $scope.project.projectName}));
					$scope.queryProjectUsers();
				}
			});
		}
	};

	$scope.selectUser = function(item) {
		$scope.user = item;
		$scope.typeahead.userName = item.name;
		$scope.updateAddMode('addExisting');
	};

	$scope.imageSource = function(avatarRef) {
		return avatarRef ? '/images/shared/avatar/' + avatarRef : '/images/shared/avatar/anonymous02.png';
	};

}])
;
