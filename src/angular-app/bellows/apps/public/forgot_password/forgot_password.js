'use strict';

angular.module('forgot_password', ['bellows.services', 'ui.bootstrap', 'pascalprecht.translate',
  'palaso.ui.notice', 'palaso.ui.utils'
])
  .config(['$translateProvider',
    function ($translateProvider) {

      // configure interface language filepath
      $translateProvider.useStaticFilesLoader({
        prefix: '/angular-app/bellows/lang/',
        suffix: '.json'
      });
      $translateProvider.preferredLanguage('en');
    }
  ])
  .controller('ForgotPasswordCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',
    function ($scope, userService, sessionService, notice) {
    }
  ])

;
