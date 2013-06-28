'use strict';

/* Controllers */

function makeDataController(tableName) {
	return function($scope, $http, jsonRpc) {

		$scope.vars = {
			selectedIndex: -1,
			editButtonName: "",
			editButtonIcon: "",
			recordType: tableName,
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
			var promise = jsonRpc.call($scope.vars.recordType + "_list", {}, function(result) {
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
				$scope.vars.editButtonName = "Edit";
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
			var promise = jsonRpc.call($scope.vars.recordType + "_update", {"params": record}, function(result) {
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
			var promise = jsonRpc.call($scope.vars.recordType + "_delete", {"id": record.id}, function(result) {
				$scope.fetchRecordList();
				$scope.selectRow(-1);
			});
			$scope.vars.editButtonName = "";
			$scope.vars.editButtonIcon = "";
			return promise;
		};

	};
}

var app = angular.module('sfAdmin', ['jsonRpc', 'sfAdmin.directives'])
	.controller('UserCtrl', ['$scope', '$http', 'jsonRpc', makeDataController('user')])
	.controller('ProjectCtrl', ['$scope', '$http', 'jsonRpc', makeDataController('project')])
	;
