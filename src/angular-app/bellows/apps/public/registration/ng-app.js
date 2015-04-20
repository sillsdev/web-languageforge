'use strict';

angular.module('registration', [ 'bellows.services', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils'])
.controller('UserCtrl', ['$scope', '$location', 'userService', 'sessionService', 'silNoticeService', '$window', 
                         function UserCtrl($scope, $location, userService, sessionService, notice, $window) {

  $scope.record = {};
  $scope.record.id = '';
  $scope.showForm = false;
  $scope.errorState = false;
  
  // initialize the page by reading the user with the given validation key
  var validationKey = $location.search().v; // get this from the URL
  if (validationKey != undefined && validationKey.length > 0) {
    userService.readForRegistration(validationKey, function(result) {
      if (result.ok) {
        if (result.data.length != 0) {
          $scope.showForm = true;
          $scope.record = result.data;
        } else {
          $scope.errorState = true;
        }
      }
    });
  } else {
    $scope.errorState = true;
  }
  
  $scope.registerUser = function(record) {
    $scope.requestInProgress = true;
    userService.updateFromRegistration(validationKey, record, function(result) {
      $scope.requestInProgress = false;
      if (result.ok) {
        if (result.data) {
          notice.push(notice.SUCCESS, "Thank you, " + record.name + ", for joining!  You can now login.");
          $("#userForm").fadeOut(1000, function() {
            $window.location.href = '/auth/login';
          });
        }
      }
    });
    return true;
  };

  $scope.resetValidateRegistrationForm = function resetValidateRegistrationForm() {

    $scope.userNameOk = false;
    $scope.userNameExists = false;
  };

  $scope.checkUserName = function() {
    $scope.userNameOk = false;
    $scope.userNameExists = false;
    if ($scope.record.username) {
      $scope.userNameLoading = true;
      userService.identityCheck($scope.record.username, '', function(result) {
        $scope.userNameLoading = false;
        if (result.ok) {
          if (result.data.usernameExists) {
            $scope.userNameOk = false;
            $scope.userNameExists = true;
          } else {
            $scope.userNameOk = true;
            $scope.userNameExists = false;
          }
        }
      });
    }
  };
}])
;