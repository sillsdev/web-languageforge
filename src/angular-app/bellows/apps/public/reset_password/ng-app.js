'use strict';

angular.module('reset_password', ['bellows.services', 'ui.bootstrap', 'pascalprecht.translate', 'palaso.ui.notice', 'palaso.ui.utils'])
  .config(['$translateProvider',
    function($translateProvider) {

      // configure interface language filepath
      $translateProvider.useStaticFilesLoader({
        prefix: '/angular-app/bellows/lang/',
        suffix: '.json',
      });
      $translateProvider.preferredLanguage('en');
    },
  ])
  .controller('ResetPasswordCtrl', ['$scope', '$location', '$window', 'userService',
    function($scope, $location, $window, userService) {
      var absUrl = $location.absUrl();
      var appName = '/reset_password/';
      var forgotPasswordKey = absUrl.substring(absUrl.indexOf(appName) + appName.length);

      $scope.record = {};

      $scope.resetPassword = function resetPassword() {
        $scope.submissionInProgress = true;
        if ($scope.record.password == $scope.confirmPassword && forgotPasswordKey) {
          userService.resetPassword(forgotPasswordKey, $scope.record.password, function(result) {
            if (result.ok) {
              $window.location.href = '/auth/login';
            }
          });
        }

        $scope.submissionInProgress = false;
      };

    },
  ])

;
