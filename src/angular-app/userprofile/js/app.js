'use strict';

function updateContactMethodUI($scope) {
	if ($scope.user) {
		if ($scope.user.communicate_via_email && $scope.user.communicate_via_sms) {
			$scope.contact_method = 'both';
		}
		else if ($scope.user.communicate_via_sms) {
			$scope.contact_method = 'sms';
		}
		else {
			// default case when not set
			$scope.contact_method = 'email';
		}
	}
}

function setUserModelContactMethod($scope) {
	if ($scope.user) {
		if ($scope.contact_method == 'both') {
			$scope.user.communicate_via_email = true;
			$scope.user.communicate_via_sms = true;
		}
		else if ($scope.contact_method == 'sms') {
			$scope.user.communicate_via_email = false;
			$scope.user.communicate_via_sms = true;
		}
		else if ($scope.contact_method == 'email') {
			$scope.user.communicate_via_email = true;
			$scope.user.communicate_via_sms = false;
		}
	}
}

function userProfileCtrl($scope, userService) {
	$scope.notify = {};
	
	
	var loadUser = function() {
		userService.read(window.session.userid, function(result) {
			if (result.ok) {
				$scope.user = result.data;
				updateContactMethodUI($scope);
			} else {
				// TODO report the real error
				$scope.notify.error = 'something went wrong';
			}
		});
	};	
	
	$scope.updateUser = function() {
		setUserModelContactMethod($scope);
		userService.update($scope.user, function(result) {
			if (result.ok) {
				console.log("updated user profile successfully.");
				$scope.notify.message = "Profile updated successfully.";
			} else {
				// TODO report the real error
				$scope.notify.error = 'something went wrong';
				console.log("error updating user profile.");
			}
		});
	}
	
	// load the user data right away
	loadUser();
}

angular.module('userProfile', ['jsonRpc', 'ui.bootstrap', 'sf.services']).
controller('userProfileCtrl', ['$scope', 'userService', userProfileCtrl])
;
