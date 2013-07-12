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

function getAvatarUrl(color, shape) {
	var imgPath = "/images/avatar";
	if (color == "" || shape == "") {
		return imgPath + "/anonymoose.png";
	}
	return imgPath + "/" + color + "-" + shape + "-48x48.png";
}

function userProfileCtrl($scope, userService) {
	$scope.notify = {};
	
	/*
	$scope.avatar = {"filename": "anonymoose.jpg",
					 "color": "",
					 "shape": ""
					 };
					 
	$scope.$watch(function () { return $scope.avatar.color + $scope.avatar.shape; }, function() {
		$if ($scope.avatar.color != "" && $scope.avatar.shape != "") {
			$scope.avatar.filename = $scope.avatar.color + "-" + $scope.avatar.shape + "-48x48.png";
		}
	});
	*/
	
	
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
	
	$scope.avatarUrl = function() {
		return getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
	}
	
	$scope.updateUser = function() {
		setUserModelContactMethod($scope);
		$scope.user.avatar_ref = getAvatarUrl($scope.user.avatar_color, $scope.user.avatar_shape);
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
