'use strict';

/* Controllers */

angular.module(
	'sfAdmin.controllers',
	[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice']
)
.controller('UserCtrl', ['$scope', 'userService', 'silNoticeService', function UserCtrl($scope, userService, notice) {

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
	}
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
//		console.log("Called selectRow(", index, ", ", record, ")");
		$scope.vars.selectedIndex = index;
		if (index < 0) {
			$scope.vars.record = {};
		} else {
			$scope.vars.record = record;
			$scope.vars.editButtonName = "Save";
			$scope.vars.editButtonIcon = "pencil";
			$scope.vars.state = "update";
			$scope.hidePasswordForm();
		}
	};

	$scope.$watch("vars.record.id", function(newId, oldId) {
		// attrs.$observe("userid", function(newval, oldval) {
//		console.log("Watch triggered with oldval '" + oldId + "' and newval '" + newId + "'");
		if (newId) {
			userService.read(newId, function(result) {
				$scope.record = result.data;
				$scope.resetCheckName();
			});
		} else {
			// Clear data table
			$scope.record = {};
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
        'system_admin': {name: 'System Admin'}
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
	}
	
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
			$scope.record = {};
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
	}

/*
	$scope.updateRecord = function(record) {
//		console.log("updateRecord() called with ", record);
		if (record === undefined || JSON.stringify(record) == "{}") {
			// Avoid adding blank records to the database
			return null; // TODO: Or maybe just return a promise object that will do nothing...?
		}
		
		var isNewRecord = false;
		if (record.id === undefined) {
			isNewRecord = true; // Will be used below
			record.id = '';
//			if (record.groups === undefined) {
//				record.groups = [null]; // TODO: Should we put something into the form to allow setting gropus? ... Later, not now.
//			}
		}
		var afterUpdate;
		if (record.password) {
			afterUpdate = function(result) {
				record.id = result.data;
				// TODO Don't do this as a separate API call here. CP 2013-07
				$scope.changePassword(record);
			};
		} else {
			afterUpdate = function(result) {
				// Do nothing
			};
		}
		userService.update(record, function(result) {
			afterUpdate(result);
			$scope.queryUsers(true);
			if (isNewRecord) {
				$scope.record = {};
				$scope.focusInput();
			} else {
				$scope.blurInput();
			}
		});
		return true;
	};
	*/

	$scope.removeUsers = function() {
//		console.log("removeUsers");
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
//		console.log("changePassword() called with ", record);
		userService.changePassword(record.id, record.password, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "Password for " + record.name + " updated successfully");
			}
//			console.log("Password successfully changed.");
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
/*
.controller('PasswordCtrl', ['$scope', 'jsonRpc', function($scope, jsonRpc) {
	$scope.changePassword = function(record) {
		// Validation
		if (record.password != record.confirmPassword) {
			console.log("Error: passwords do not match");
			// TODO: Learn how to do Angular validation so I can give control back to the user. RM 2013-07
			return null;
		}
		jsonRpc.connct("/api/sf");
		params = {
			"userid": record.id,
			"newPassword": record.password,
		};
	};
}])
*/
;
