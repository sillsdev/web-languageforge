'use strict';

angular.module('usermanagement.joinRequests', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice', 'ngRoute'])

  .controller('JoinRequestsCtrl', ['$scope', 'userService', 'projectService', 'sessionService',
    function($scope, userService, projectService, ss) {
      
      $scope.acceptJoinRequest = function acceptJoinRequest(userId, role) {
        projectService.acceptJoinRequest(userId, role, function(result) {
          if (result.ok) {
            projectService.getJoinRequests(function(result) {
              $scope.joinRequests = result.data;
             });
          }
        })
      }
      
      $scope.denyJoinRequest = function denyJoinRequest(userId) {
        projectService.denyJoinRequest(userId, function(result) {
          if (result.ok) {
            projectService.getJoinRequests(function(result) {
              $scope.joinRequests = result.data;
             });
          }
        })
      }
      
      // load roles if they have not been loaded yet
      if (Object.keys($scope.roles).length == 0) {
        $scope.queryUserList();
      }
      
      $scope.rights = {};
      $scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE);
      $scope.rights.add = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE);
      $scope.rights.changeRole = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
    }
  ])
;
