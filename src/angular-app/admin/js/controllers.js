'use strict';

/* Controllers */

var app = angular.module('myApp', ['jsonRpc', 'myApp.directives']).
	controller('AdminCtrl', function($scope, $http, jsonRpc) {
		// How to create the JSON-RPC request by hand:
/*		var request = {
			"version": "2.0",
			"method": "user_list",
			"params": {},
			"id": 1
		};
		var requestbody = JSON.stringify(request);
		$scope.data = $http({"url": "/api/sf/user_list", "method": "POST", "data": requestbody, "headers": {"Content-Type": "application/json"}});
*/
		
		// How to use my JSON-RPC helper:
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
		$scope.vars = {selectedIndex: -1};
		$scope.selectRow = function(index, record) {
			console.log("Called selectRow(", index, ", ", record, ")");
			$scope.vars.selectedIndex = index;
			if (index < 0) {
				$scope.vars.userid = undefined;
				$scope.vars.user = {};
			} else {
				$scope.vars.userid = record.id;
				$scope.vars.user = record; // Not using this yet, but we might soon
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
		/* Now, note that the following line will NOT work yet: */
		// $scope.data.message = "Hello ";
		/* This is because jsonRpc.call() uses $http, which is asynchronous. By this
		 * point, the HTTP request has been sent off but has not yet returned. The
		 * callback function will create $scope.data once the HTTP request returns,
		 * but that hasn't happened yet. So to guarantee that $scope.data exists
		 * before we try to set its message attribute, we need to use the then()
		 * method of promises (http://docs.angularjs.org/api/ng.$q). This will ensure
		 * that the callback will have been called first, then the following code will
		 * happen. You can also chain these then() calls if several things need to
		 * happen in sequence.
		 */
	
		
		// A function to use in ng-click attributes
		$scope.setVar = function(varName, newValue) {
			// This may be way more complicated than it needs; we'll see...
			$scope.vars[varName] = newValue;
		};
		})
  .controller('MyCtrl2', [function() {

  }]);