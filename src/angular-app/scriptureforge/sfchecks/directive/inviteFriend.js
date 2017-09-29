'use strict';

angular.module('sf.ui.invitefriend', ['bellows.services', 'palaso.ui.notice'])
  .controller('inviteAFriend', ['$scope', 'userService', 'sessionService', 'silNoticeService', '$location', '$rootScope', '$routeParams',
  function($scope, userService, ss, notice, $location, $rootScope, $routeParams) {

    $scope.showInviteForm = false;
    $scope.showInviteDiv = true;

    ss.getSession().then(function(session) {
      $scope.canCreateUsers = function() {
        return session.hasProjectRight(ss.domain.USERS, ss.operation.CREATE);
      };

      $scope.checkVisibility = function() {
        $scope.showInviteDiv = session.getProjectSetting('allowInviteAFriend') || $scope.canCreateUsers();
      };

      $rootScope.$on('$viewContentLoaded', $scope.checkVisibility);
      $scope.checkVisibility();
    });

    $scope.sendInvite = function() {
      userService.sendInvite($scope.email, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, "An invitation email has been sent to " + $scope.email);
          $scope.showInviteForm = false;
          $scope.email = '';
        }
      });
    };
  }])
  ;
