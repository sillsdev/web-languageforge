'use strict';

angular.module('lexicon.manage-users', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'sgw.ui.breadcrumb', 'palaso.ui.notice', 'palaso.ui.textdrop'])
.controller('manageUsersCtrl', ['$scope', 'userService', 'projectService', 'sessionService', 'silNoticeService', 'lexProjectService', 'lexConfigService',
                                    function($scope, userService, projectService, ss, notice, lexProjectService, configService) {

	$scope.queryProjectUsers = function() {
		lexProjectService.users(function(result) {
			if (result.ok) {
				configService.setConfig(result.data.config);
				$scope.project = result.data.project;
				$scope.list.users = result.data.users;
				$scope.list.userCount = result.data.userCount;
				
				// Rights
				var rights = result.data.rights;
				$scope.rights = {};
				$scope.rights.deleteOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.DELETE); 
				$scope.rights.create = ss.hasRight(rights, ss.domain.USERS, ss.operation.CREATE); 
				$scope.rights.editOther = ss.hasRight(rights, ss.domain.USERS, ss.operation.EDIT);
				$scope.rights.showControlBar = $scope.rights.deleteOther || $scope.rights.create || $scope.rights.editOther;
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
//		console.log("removeUsers");
		var userIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			userIds.push($scope.selected[i].id);
		}
		if (l == 0) {
			// TODO ERROR
			return;
		}
		projectService.removeUsers($scope.project.id, userIds, function(result) {
			if (result.ok) {
				$scope.queryProjectUsers();
				$scope.selected = [];
				if (userIds.length == 1) {
					notice.push(notice.SUCCESS, "The user was removed from this project");
				} else {
					notice.push(notice.SUCCESS, userIds.length + " users were removed from this project");
				}
			}
		});
	};
	
	// Roles in list
	$scope.roles = [
		{key: 'user', name: 'Member'},
		{key: 'project_admin', name: 'Manager'}
	];
	
	$scope.onRoleChange = function(user) {
		var model = {};
		model.id = user.id;
		model.role = user.role;
//		console.log('userchange...', model);
		projectService.updateUser($scope.project.id, model, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, user.username + "'s role was changed to " + user.role);
			}
		});
	};
	
	// ----------------------------------------------------------
	// Typeahead
	// ----------------------------------------------------------
	$scope.users = [];
	$scope.addModes = {
		'addNew': { 'en': 'Create New User', 'icon': 'icon-user'},
		'addExisting' : { 'en': 'Add Existing User', 'icon': 'icon-user'},
		'invite': { 'en': 'Send Email Invite', 'icon': 'icon-envelope'}
	};
	$scope.addMode = 'addNew';
	$scope.typeahead = {};
	$scope.typeahead.userName = '';
	
	$scope.queryUser = function(userName) {
//		console.log('searching for ', userName);
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
			userService.createSimple($scope.typeahead.userName, $scope.project.id, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "User created.  Username: " + $scope.typeahead.userName + "    Password: " + result.data.password);
					$scope.queryProjectUsers();
				};
			});
		} else if ($scope.addMode == 'addExisting') {
			var model = {};
			model.id = $scope.user.id;
			projectService.updateUser($scope.project.id, model, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "'" + $scope.user.name + "' was added to " + $scope.project.projectname + " successfully");
					$scope.queryProjectUsers();
				}
			});
		} else if ($scope.addMode == 'invite') {
			userService.sendInvite($scope.typeahead.userName, $scope.project.id, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "'" + $scope.typeahead.userName + "' was invited to join the project " + $scope.project.projectname);
					$scope.queryProjectUsers();
				}
			});
		}
	};

	$scope.selectUser = function(item) {
//		console.log('user selected', item);
		$scope.user = item;
		$scope.typeahead.userName = item.name;
		$scope.updateAddMode('addExisting');
	};

	$scope.imageSource = function(avatarRef) {
		return avatarRef ? '/images/shared/avatar/' + avatarRef : '/images/shared/avatar/anonymous02.png';
	};

}])
;
