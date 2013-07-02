'use strict';

function userProfileCtrl($scope) {
	$scope.user = {'name' : 'Chris', 'id': 1};
}

angular.module('userProfile', ['jsonRpc', 'ui.bootstrap']).
controller('userProfileCtrl', ['$scope', userProfileCtrl])
;
