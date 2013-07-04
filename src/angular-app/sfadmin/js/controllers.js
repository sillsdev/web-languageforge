'use strict';

/* Controllers */

function UserCtrl($scope, $http, jsonRpc) {

	$scope.vars = {
		selectedIndex: -1,
		editButtonName: "",
		editButtonIcon: "",
		inputfocus: false,
		showPasswordForm: false,
	};
	
	$scope.focusInput = function() {
		$scope.vars.inputfocus = true;
	};

	$scope.blurInput = function() {
		$scope.vars.inputfocus = false;
	};

	$scope.fetchRecordList = function() {
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("user_list", {}, function(result) {
			if (result.ok) {
				$scope.data = result.data;
			} else {
				$scope.data = {};
			};
		});
		return promise;
	};
	$scope.fetchRecordList();  // And run it right away to fetch the data for our list.

	$scope.selectRow = function(index, record) {
		console.log("Called selectRow(", index, ", ", record, ")");
		$scope.vars.selectedIndex = index;
		if (index < 0) {
			$scope.vars.record = {};
		} else {
			$scope.vars.record = record;
			$scope.vars.editButtonName = "Save";
			$scope.vars.editButtonIcon = "pencil";
		}
	};

	$scope.addRecord = function() {
		$scope.selectRow(-1); // Make a blank entry in the "User data" area
		// TODO: Signal the user somehow that he should type in the user data area and hit Save
		// Right now this is not intuitive, so we need some kind of visual signal
		$scope.vars.editButtonName = "Add";
		$scope.vars.editButtonIcon = "plus";
		$scope.focusInput();
	};

	$scope.updateRecord = function(record) {
		console.log("updateRecord() called with ", record);
		if (record === undefined || record === {}) {
			// Avoid adding blank records to the database
			return null; // TODO: Or maybe just return a promise object that will do nothing...?
		}
		
		var isNewRecord = false;
		if (record.id === undefined) {
			isNewRecord = true; // Will be used below
//			if (record.groups === undefined) {
//				record.groups = [null]; // TODO: Should we put something into the form to allow setting gropus? ... Later, not now.
//			}
		}
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("user_update", {"params": record}, function(result) {
			$scope.fetchRecordList();
			console.log("Result of promise: ", result.data.result);
		});
		if (record.password) {
			promise = promise.then(function(result) {
				record.id = result.data.result;
				$scope.changePassword(record);
			});
		}
		if (isNewRecord) {
			// We just added a record... so clear the user data area so we can add a new one later
			$scope.record = {};
			// And focus the input box so the user can just keep typing
			$scope.focusInput();
		} else {
			// We just edited a record, so remove focus from the user data area
			$scope.blurInput();
		}
		return promise;
	};

	$scope.deleteRecord = function(record) {
		console.log("deleteRecord() called with ", record);
		if ($scope.vars.selectedIndex < 0) {
			// TODO: It would be better to really disable the button, but this quick hack will work for now
			console.log("Deleting nothing since nothing is really selected");
			return null;
		}
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("user_delete", {"id": record.id}, function(result) {
			$scope.fetchRecordList();
			$scope.selectRow(-1);
		});
		$scope.vars.editButtonName = "";
		$scope.vars.editButtonIcon = "";
		return promise;
	};
	
	$scope.changePassword = function(record) {
		console.log("changePassword() called with ", record);
		jsonRpc.connect("/api/sf");
		var params = {
			"userid": record.id,
			"newPassword": record.password
		};
		jsonRpc.call("change_password", params, function(result) {
			console.log("Password successfully changed.");
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
	}

}

function ProjectCtrl($scope, $http, jsonRpc) {
	$scope.vars = {
		selectedIndex: -1,
		editButtonName: "",
		editButtonIcon: "",
		recordType: "project",
		inputfocus: false,
	};
	
	$scope.focusInput = function() {
		$scope.vars.inputfocus = true;
	};

	$scope.blurInput = function() {
		$scope.vars.inputfocus = false;
	};

	$scope.fetchRecordList = function() {
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("project_list", {}, function(result) {
			if (result.ok) {
				$scope.data = result.data;
			} else {
				$scope.data = {};
			};
		});
		return promise;
	};
	$scope.fetchRecordList();  // And run it right away to fetch the data for our list.

	$scope.selectRow = function(index, record) {
		console.log("Called selectRow(", index, ", ", record, ")");
		$scope.vars.selectedIndex = index;
		if (index < 0) {
			$scope.vars.record = {};
		} else {
			$scope.vars.record = record;
			$scope.vars.editButtonName = "Save";
			$scope.vars.editButtonIcon = "pencil";
		}
	};

	$scope.addRecord = function() {
		$scope.selectRow(-1); // Make a blank entry in the "User data" area
		// TODO: Signal the user somehow that he should type in the user data area and hit Save
		// Right now this is not intuitive, so we need some kind of visual signal
		$scope.vars.editButtonName = "Add";
		$scope.vars.editButtonIcon = "plus";
		$scope.focusInput();
	};

	$scope.updateRecord = function(record) {
		console.log("updateRecord() called with ", record);
		if (record === undefined || record === {}) {
			// Avoid adding blank records to the database
			return null; // TODO: Or maybe just return a promise object that will do nothing...?
		}
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("project_update", {"params": record}, function(result) {
			$scope.fetchRecordList();
		});
		if (record.id === undefined) {
			// We just added a record... so clear the user data area so we can add a new one later
			$scope.record = {};
			// And focus the input box so the user can just keep typing
			$scope.focusInput();
		} else {
			// We just edited a record, so remove focus from the user data area
			$scope.blurInput();
		}
		return promise;
	};

	$scope.deleteRecord = function(record) {
		console.log("deleteRecord() called with ", record);
		if ($scope.vars.selectedIndex < 0) {
			// TODO: It would be better to really disable the button, but this quick hack will work for now
			console.log("Deleting nothing since nothing is really selected");
			return null;
		}
		jsonRpc.connect("/api/sf");
		var promise = jsonRpc.call("project_delete", {"id": record.id}, function(result) {
			$scope.fetchRecordList();
			$scope.selectRow(-1);
		});
		$scope.vars.editButtonName = "";
		$scope.vars.editButtonIcon = "";
		return promise;
	};
}

angular.module('sfAdmin.controllers', ['jsonRpc'])
.controller('UserCtrl', ['$scope', '$http', 'jsonRpc', UserCtrl])
.controller('ProjectCtrl', ['$scope', '$http', 'jsonRpc', ProjectCtrl])
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
;