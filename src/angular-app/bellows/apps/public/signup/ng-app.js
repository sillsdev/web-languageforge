'use strict';

// based on http://scotch.io/tutorials/javascript/angularjs-multi-step-form-using-ui-router
// also http://www.ng-newsletter.com/posts/angular-ui-router.html

// Declare app level module which depends on filters, and services
angular.module('signup', ['bellows.services', 'ui.bootstrap', 'ngAnimate', 'ui.router', 'pascalprecht.translate'])
.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', 
         function($stateProvider, $urlRouterProvider, $translateProvider) {
	
	$stateProvider
		// route to show our basic form (/form)
		.state('form', {
			url: '/form',
			templateUrl: '/angular-app/bellows/apps/public/signup/views/form.html',
			controller: 'SignupCtrl'
		})
		
		// nested states 
		// each of these sections have their own view
		// url will be nested (/form/identity)
		.state('form.identity', {
			url: '/identity',
			templateUrl: '/angular-app/bellows/apps/public/signup/views/form-identity.html'
		})
		
		// url will be /form/details
		.state('form.details', {
			url: '/details',
			templateUrl: '/angular-app/bellows/apps/public/signup/views/form-details.html'
		})
		
		// url will be /form/complete
		.state('form.complete', {
			url: '/complete',
			templateUrl: '/angular-app/bellows/apps/public/signup/views/form-complete.html'
		});
	
	// catch all route
	// send users to the form page 
	$urlRouterProvider.otherwise('/form/identity');
	
	// configure interface language filepath
	$translateProvider.useStaticFilesLoader({
		prefix: '/angular-app/languageforge/lexicon/lang/',
		suffix: '.json'
	});
	$translateProvider.preferredLanguage('en');
}])
.controller('SignupCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService',  
                           function($scope, userService, sessionService, notice) {
	$scope.showPassword = false;
	$scope.record = {};
	$scope.record.id = '';
	$scope.captchaSrc = '';
	$scope.status = '';
	
	$scope.getCaptchaSrc = function() {
		sessionService.getCaptchaSrc(function(result) {
			if (result.ok) {
				$scope.captchaSrc = result.data;
				$scope.record.captcha = "";
			}
		});
	};
	
	$scope.processForm = function() {
		alert('awesome!');
	};
	
	$scope.createUser = function(record) {
		$scope.submissionInProgress = true;
		userService.register(record, function(result) {
			$scope.submissionInProgress = false;
			if (result.ok) {
				if (!result.data) {
					notice.push(notice.WARN, "The image verification failed.  Please try again");
					$scope.getCaptchaSrc();
				} else {
					$scope.submissionComplete = true;
					//notice.push(notice.SUCCESS, "Thank you for signing up.  We've sent you an email to confirm your registration. Please click the link in the email to activate your account.  If you don't see your activation email, check your email's SPAM folder.");
				}
			}
		});
		return true;
	};
	
	$scope.checkUserName = function() {
		$scope.userNameOk = false;
		$scope.userNameExists = false;
		if ($scope.record.username) {
			$scope.userNameLoading = true;
			userService.userNameExists($scope.record.username, function(result) {
				$scope.userNameLoading = false;
				if (result.ok) {
					if (result.data) {
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
	
	$scope.getCaptchaSrc();
	
}])
;
