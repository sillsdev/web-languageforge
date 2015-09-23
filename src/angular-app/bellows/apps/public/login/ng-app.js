'use strict';

angular.module('login', ['bellows.services', 'ui.bootstrap', 'pascalprecht.translate', 'palaso.ui.notice', 'palaso.ui.utils'])
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
  .controller('LoginCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',
    function($scope, userService, sessionService, notice) {
    },
  ])

;
