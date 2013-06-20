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
		$scope.data.message = "Hello ";*/
		
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
		$scope.updateUser = function(record) {
			console.log("updateUser() called with ", record);
			jsonRpc.connect("/api/sf");
			var promise = jsonRpc.call("user_update", {"params": record}, function(result) {
				$scope.fetchUserList();
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
		var promise = $scope.fetchUserList();
		promise.then(function() {
			$scope.data.message = "Hello ";
		});
		
		$scope.vars = {};
		
		// A function to use in ng-click attributes
		$scope.setVar = function(varName, newValue) {
			// This may be way more complicated than it needs; we'll see...
			$scope.vars[varName] = newValue;
		};
		})
  .controller('MyCtrl2', [function() {

  }]);