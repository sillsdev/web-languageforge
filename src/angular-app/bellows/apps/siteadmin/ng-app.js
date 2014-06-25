'use strict';

angular.module('siteadmin', [
	'ngRoute', 'sfAdmin.filters', 'sfAdmin.services', 'sfAdmin.directives',
	'bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'palaso.ui.notice', 'ui.bootstrap'
])
/*
.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
	$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
	$routeProvider.otherwise({redirectTo: '/view1'});
}])
*/
.controller('UserCtrl', ['$scope', 'userService', 'silNoticeService', function UserCtrl($scope, userService, notice) {

	$scope.filterUsers = '';
	$scope.vars = {
		selectedIndex: -1,
		editButtonName: "",
		editButtonIcon: "",
		inputfocus: false,
		showPasswordForm: false,
		state: "add" // can be either "add" or "update"
	};
	
	$scope.resetCheckName = function() {
		$scope.userNameLoading = false;
		$scope.userNameExists = false;
		$scope.userNameOk = false;
	};
	$scope.resetCheckName();
	
	$scope.focusInput = function() {
		$scope.vars.inputfocus = true;
	};

	$scope.blurInput = function() {
		$scope.vars.inputfocus = false;
	};

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

	$scope.queryUsers = function(invalidateCache) {
		var forceReload = (invalidateCache || (!$scope.users) || ($scope.users.length == 0));
		if (forceReload) {
			userService.list(function(result) {
				if (result.ok) {
					$scope.users = result.data.entries;
				} else {
					$scope.users = [];
				};
			});
		} else {
			// No need to refresh the cache: do nothing
		}
	};
	//$scope.queryUsers();  // And run it right away to fetch the data for our list.

	$scope.selectRow = function(index, record) {
		$scope.vars.selectedIndex = index;
		if (index < 0) {
			$scope.vars.record = {role: 'user'};
		} else {
			$scope.vars.record = record;
			$scope.vars.editButtonName = "Save";
			$scope.vars.editButtonIcon = "ok";
			$scope.vars.state = "update";
			$scope.hidePasswordForm();
		}
	};

	$scope.$watch("vars.record.id", function(newId, oldId) {
		if (newId) {
			userService.read(newId, function(result) {
				$scope.record = result.data;
				$scope.resetCheckName();
			});
		} else {
			// Clear data table
			$scope.record = {role: 'user'};
		}
	});

	$scope.addRecord = function() {
		$scope.selectRow(-1); // Make a blank entry in the "User data" area
		// TODO: Signal the user somehow that he should type in the user data area and hit Save
		// Right now this is not intuitive, so we need some kind of visual signal
		$scope.vars.editButtonName = "Add";
		$scope.vars.editButtonIcon = "plus";
		$scope.vars.state = "add";
		$scope.showPasswordForm();
		$scope.focusInput();
	};

	// Roles in list
	$scope.roles = {
        'user': {name: 'User'},
        'system_admin': {name: 'Site Administrator'}
	};
	
	$scope.roleLabel = function(role) {
		if (role == undefined) {
			return '';
		}
		return $scope.roles[role].name;
	};
	
	$scope.checkUserName = function() {
		$scope.userNameOk = false;
		$scope.userNameExists = false;
		if ($scope.record.username && $scope.vars.state == "add") {
			$scope.userNameLoading = true;
			userService.userNameExists($scope.record.username, function(result) {
				$scope.userNameLoading = false;
				if (result.ok) {
					if (result.data) {
						$scope.userNameOk = false;
						$scope.userNameExists = true;
					} else {
						$scope.userNameOk = true;
						$scope.userNameExists = false;
					}
				}
			});
		}
	};
	
	$scope.updateRecord = function(record) {
		if (record.id == undefined) {
			// add a new user
			record.id = '';
			
			userService.create(record, function(result) {
				if (result.ok) {
					if (result.data) {
						notice.push(notice.SUCCESS, "The user " + record.username + " was successfully added");
					} else {
						notice.push(notice.ERROR, "API Error: the username already exists!  (this should not happen)");
					}
				}
				
			});
			$scope.record = {role: 'user'};
			$scope.focusInput();
			
		} else {
			// update an existing user
			userService.update(record, function(result) {
				if (result.ok) {
					if (result.data) {
						notice.push(notice.SUCCESS, "The user " + record.username + " was successfully updated");
					}
				}
			});
			if (record.password) {
				$scope.changePassword(record);
				$scope.record.password = "";
			}
			$scope.blurInput();
		}
		
		$scope.resetCheckName();
		$scope.queryUsers(true);
	};

	$scope.removeUsers = function() {
		var userIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			userIds.push($scope.selected[i].id);
		}
		if (l == 0) {
			// TODO ERROR
			return;
		}
		userService.remove(userIds, function(result) {
			if (result.ok) {
				if (result.data == 1) {
					notice.push(notice.SUCCESS, "1 user was deleted");
				} else if (result.data > 1) {
					notice.push(notice.SUCCESS, result.data + " users were deleted");
				} else {
					notice.push(notice.ERROR, "Error deleting one or more users");
				}
			}
			// Whether result was OK or error, wipe selected list and reload data
			$scope.selected = [];
			$scope.vars.selectedIndex = -1;
			$scope.queryUsers(true);
		});
	};

	$scope.changePassword = function(record) {
		userService.changePassword(record.id, record.password, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "Password for " + record.name + " updated successfully");
			}
		});
	};
	
	$scope.showPasswordForm = function() {
		$scope.vars.showPasswordForm = true;
	};
	$scope.hidePasswordForm = function() {
		$scope.vars.showPasswordForm = false;
	};
	$scope.togglePasswordForm = function() {
		$scope.vars.showPasswordForm = !$scope.vars.showPasswordForm;
	};

}])
.controller('ArchivedProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService', function($scope, projectService, ss, notice) {
	$scope.finishedLoading = false;
	$scope.projectTypeNames = projectService.data.projectTypeNames;
	$scope.list = {};
	$scope.list.archivedProjects = [];
	// Rights
	$scope.rights = {};
	$scope.rights.archive = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE); 
	$scope.rights.showControlBar = $scope.rights.archive;

	$scope.queryArchivedProjects = function() {
		projectService.archivedList(function(result) {
			if (result.ok) {
				for (var i = 0; i < result.data.entries.length; i++) {
					result.data.entries[i].dateModified = new Date(result.data.entries[i].dateModified);
				}
				$scope.list.archivedProjects = result.data.entries;

				$scope.finishedLoading = true;
			}
		});
	};
	
	// Listview Selection
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
	
	// Publish Projects
	$scope.publishProjects = function() {
		var projectIds = [];
		for(var i = 0, l = $scope.selected.length; i < l; i++) {
			projectIds.push($scope.selected[i].id);
		}
		projectService.publish(projectIds, function(result) {
			if (result.ok) {
				$scope.selected = []; // Reset the selection
				$scope.queryArchivedProjects();
				if (projectIds.length == 1) {
					notice.push(notice.SUCCESS, "The project was re-published successfully");
				} else {
					notice.push(notice.SUCCESS, "The projects were re-published successfully");
				}
			}
		});
	};
}])
;
