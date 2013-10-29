'use strict';

angular.module('sf.ui.invitefriend', ['sf.services', 'palaso.ui.notice'])
	.controller('inviteAFriend', ['$scope', 'userService', 'silNoticeService', '$routeParams', function($scope, userService, notice, $routeParams) {
		$scope.showInviteForm = false;
		$scope.sendInvite = function() {
			userService.sendInvite($scope.email, $routeParams.projectId, function(result) {
				if (result.ok) {
					notice.push(notice.SUCCESS, "An invitation email has been sent to " + $scope.email);
					$scope.showInviteForm = false;
				}
			});
		};
	}])
	;
