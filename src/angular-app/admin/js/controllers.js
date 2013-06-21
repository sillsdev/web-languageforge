'use strict';

/* Controllers */

var app = angular.module('myApp', ['jsonRpc', 'myApp.directives']).
	controller('AdminCtrl', function($scope, $http, jsonRpc) {

		$scope.vars = {selectedIndex: -1};

		$scope.fetchUserList = function() {
			jsonRpc.connect("/api/sf");
			var promise = jsonRpc.call("user_list", {}, function(result) {
				if (result.ok) {
					$scope.data = result.data;
				} else {
					$scope.data = {};
				}
			});
			return promise;
		};
		$scope.fetchUserList();  // And run it right away to fetch the data for our list.

		$scope.selectRow = function(index, record) {
			console.log("Called selectRow(", index, ", ", record, ")");
			$scope.vars.selectedIndex = index;
			if (index < 0) {
				$scope.vars.record = {};
			} else {
				$scope.vars.record = record;
			}
		};

		$scope.addUser = function() {
			$scope.selectRow(-1); // Make a blank entry in the "User data" area
			// TODO: Signal the user somehow that he should type in the user data area and hit Save
			// Right now this is not intuitive, so we need some kind of visual signal
		};

		$scope.updateUser = function(record) {
			console.log("updateUser() called with ", record);
			if (record === undefined || record === {}) {
				// Avoid adding blank records to the database
				return null; // TODO: Or maybe just return a promise object that will do nothing...?
			}
			jsonRpc.connect("/api/sf");
			var promise = jsonRpc.call("user_update", {"params": record}, function(result) {
				$scope.fetchUserList();
			});
			if (record.id === undefined) {
				// We just added a record... so clear the user data area so we can add a new one later
				$scope.record = {};
			}
			return promise;
		};

		$scope.deleteUser = function(record) {
			console.log("deleteUser() called with ", record);
			if ($scope.vars.selectedIndex < 0) {
				// TODO: It would be better to really disable the button, but this quick hack will work for now
				console.log("Deleting nothing since nothing is really selected")
				return null;
			}
			jsonRpc.connect("/api/sf");
			var promise = jsonRpc.call("user_delete", {"id": record.id}, function(result) {
				$scope.fetchUserList();
				$scope.selectRow(-1);
			});
			return promise;
		};

	})
	.controller('MyCtrl2', [function() {
		
	}]);