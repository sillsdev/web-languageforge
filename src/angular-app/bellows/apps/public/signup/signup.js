'use strict';

// based on http://scotch.io/tutorials/javascript/angularjs-multi-step-form-using-ui-router
// also http://www.ng-newsletter.com/posts/angular-ui-router.html

// Declare app level module which depends on filters, and services
angular.module('signup', ['bellows.services', 'ui.bootstrap', 'ngAnimate', 'ui.router',
  'pascalprecht.translate', 'palaso.util.model.transform', 'palaso.ui.captcha'])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function ($stateProvider, $urlRouterProvider, $translateProvider) {
    $stateProvider

      // route to show our basic form (/form)
      .state('form', {
        // note: 'abstract' is a javascript keyword that interferes with the YUI compressor,
        // so we must reference it with quotes to make the YUI compressor work - cjh 2014-07
        'abstract': true, // jscs:ignore

        // url: '/form',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/form-abstract.html',
        controller: 'SignupCtrl'
      })

      // nested states
      // each of these sections have their own view
      // url will be nested (/form/identify)
      .state('form.identify', {
        // url: '/identify',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/form-identify.html'
      })

      // url will be /form/register
      .state('form.register', {
        // url: '/register',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/form-register.html'
      })

      // url will be /form/activate
      .state('form.activate', {
        // url: '/activate',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/form-activate.html'
      })

      // url will be /validate
      .state('validate', {
        // url: '/validate',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/validate.html'
      })

      // url will be /form/login
      .state('form.login', {
        // url: '/login',
        templateUrl: '/angular-app/bellows/apps/public/signup/views/' + bootstrapVersion + '/form-login.html'
      })
      ;

    // catch all route
    // send users to the form page
    $urlRouterProvider
      .when('', ['$state', function ($state) {
        if (!$state.$current.navigable) {
          $state.go('form.identify');
        }
      }])

      ;

    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/bellows/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
      $translateProvider.useSanitizeValueStrategy('escape');

  }])
  .controller('SignupCtrl', ['$scope', '$state', '$window', 'userService', 'sessionService',
    'silNoticeService',
  function ($scope, $state, $window, userService, sessionService, notice) {
    $scope.showPassword = false;
    $scope.record = {};
    $scope.record.id = '';
    $scope.captchaData = '';
    $scope.currentState = $state.current;
    $scope.location = $window.location;

    $scope.getCaptchaData = function () {
      sessionService.getCaptchaData(function (result) {
        if (result.ok) {
          $scope.captchaData = result.data;
          $scope.record.captcha = null;
        }
      });
    };

    $scope.processForm = function () {
      switch ($state.current.name) {
        case 'form.identify':
          $scope.checkIdentity(function () {
            if ($scope.usernameOk && !$scope.emailExists) {
              $state.go('form.register');
              $scope.getCaptchaData();
            } else if ($scope.usernameExists && !$scope.usernameExistsOnThisSite &&
                $scope.allowSignupFromOtherSites && $scope.emailIsEmpty) {
              $state.go('form.activate');
            } else if ($scope.usernameExists && !$scope.usernameExistsOnThisSite &&
                $scope.allowSignupFromOtherSites && $scope.emailMatchesAccount) {
              $state.go('form.login');
            } else {

              // error messages
              if ($scope.usernameExists) {
                $scope.signupForm.username.$setPristine();
              }

              if ($scope.emailExists) {
                $scope.signupForm.email.$setPristine();
              }
            }
          });

          break;
        case 'form.register':
          registerUser(function () {
            $state.go('validate');
          });

          break;
        case 'form.activate':
          activateUser(function () {
            $state.go('validate');
          });

          break;
        case 'form.login':
          activateUser(function (url) {
            $window.location.href = url;
          });

          break;
        default:
          break;
      }
    };

    function registerUser(successCallback) {
      $scope.submissionInProgress = true;
      userService.register($scope.record, function (result) {
        $scope.submissionInProgress = false;
        if (result.ok) {
          if (!result.data) {
            notice.push(notice.WARN, 'The image verification failed.  Please try again');
            $scope.getCaptchaData();
          } else {
            $scope.submissionComplete = true;
            (successCallback || angular.noop)();
          }
        }
      });
    }

    function activateUser(successCallback) {
      $scope.submissionInProgress = true;
      userService.activate($scope.record.username, $scope.record.password, $scope.record.email,
        function (result) {
          $scope.submissionInProgress = false;
          if (result.ok) {
            if (result.data && result.data.status == 'loginSuccess') {
              $scope.submissionComplete = true;
              (successCallback || angular.noop)(result.data.redirect.url);
            } else {
              notice.push(notice.ERROR, 'Login failed.<br /><br />If this is NOT your account, ' +
                'click <b>Back</b> to create a different account.');
            }
          }
        }
      );
    }

    $scope.checkIdentity = function (callback) {
      $scope.usernameOk = false;
      $scope.usernameExists = false;
      $scope.usernameExistsOnThisSite = false;
      $scope.allowSignupFromOtherSites = false;
      $scope.emailExists = false;
      $scope.emailIsEmpty = true;
      $scope.emailMatchesAccount = false;
      if ($scope.record.username) {
        $scope.usernameLoading = true;
        if (!$scope.record.email) {
          $scope.record.email = '';
        }

        userService.identityCheck($scope.record.username, $scope.record.email, function (result) {
          $scope.usernameLoading = false;
          if (result.ok) {
            $scope.usernameExists = result.data.usernameExists;
            $scope.usernameOk = !$scope.usernameExists;
            $scope.usernameExistsOnThisSite = result.data.usernameExistsOnThisSite;
            $scope.allowSignupFromOtherSites = result.data.allowSignupFromOtherSites;
            $scope.emailExists = result.data.emailExists;
            $scope.emailIsEmpty = result.data.emailIsEmpty;
            $scope.emailMatchesAccount = result.data.emailMatchesAccount;
          }

          (callback || angular.noop)();
        });
      }
    };

  }])

  ;
