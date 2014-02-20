'use strict';

angular.module('sf.ui.invitefriend', ['bellows.services', 'palaso.ui.notice'])
	.controller('inviteAFriend', ['$scope', 'userService', 'silNoticeService', '$location', '$rootScope', '$routeParams', function($scope, userService, notice, $location, $rootScope, $routeParams) {
		
		$scope.showInviteForm = false;
		$scope.showInviteDiv = true;
		
		$scope.checkVisibility = function() {
			$scope.showInviteDiv = true;
			if (!$routeParams.projectId) {
				var projectCode = $location.$$host.slice(0, $location.$$host.indexOf('.'));
				if (projectCode == 'www' || projectCode == 'scriptureforge' || projectCode == 'dev') {
					$scope.showInviteDiv = false;
				}
			}
		};
		
		$rootScope.$on('$viewContentLoaded', function (event, next, current) {
			$scope.checkVisibility();
		});
		
		$scope.sendInvite = function() {
			userService.sendInvite($scope.email, $routeParams.projectId, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "An invitation email has been sent to " + $scope.email);
					$scope.showInviteForm = false;
					$scope.email = '';
				}
			});
		};
		
		$scope.checkVisibility();
	}])
	;
