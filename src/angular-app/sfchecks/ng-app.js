'use strict';

// Declare app level module which depends on filters, and services
angular.module('sfchecks', 
		[
		 'ngSanitize',
		 'sfchecks.projects',
		 'sfchecks.project',
		 'sfchecks.questions',
		 'sfchecks.question',
		 'sfchecks.filters',
		 'sfchecks.services',
		 'palaso.ui.notice'
		])
	.config(['$routeProvider', function($routeProvider) {
	    $routeProvider.when(
    		'/projects', 
    		{
    			templateUrl: '/angular-app/sfchecks/partials/projects.html', 
    			controller: 'ProjectsCtrl'
    		}
	    );
	    $routeProvider.when(
    		'/project/:projectId', 
    		{
    			templateUrl: '/angular-app/sfchecks/partials/project.html', 
    			controller: 'ProjectCtrl'
    		}
    	);
	    $routeProvider.when(
	    		'/project/:projectId/settings', 
	    		{
	    			templateUrl: '/angular-app/sfchecks/partials/project-settings.html', 
	    			controller: 'ProjectSettingsCtrl'
	    		}
	    	);
	    $routeProvider.when(
    		'/project/:projectId/:textId', 
    		{
    			templateUrl: '/angular-app/sfchecks/partials/questions.html', 
    			controller: 'QuestionsCtrl'
    		}
    	);
	    $routeProvider.when(
	    		'/project/:projectId/:textId/settings', 
	    		{
	    			templateUrl: '/angular-app/sfchecks/partials/questions-settings.html', 
	    			controller: 'QuestionsSettingsCtrl'
	    		}
	    	);
	    $routeProvider.when(
    		'/project/:projectId/:textId/:questionId',
    		{
    			templateUrl: '/angular-app/sfchecks/partials/question.html', 
    			controller: 'QuestionCtrl'
			}
		);
	    $routeProvider.otherwise({redirectTo: 'projects'});
	}])
	.controller('MainCtrl', ['$scope', 'silNoticeService', '$route', '$routeParams', '$location',
	                         function($scope, noticeService, $route, $routeParams, $location) {
		$scope.route = $route;
		$scope.location = $location;
		$scope.routeParams = $routeParams;
		
//		noticeService.push(noticeService.ERROR, 'Oh snap! Change a few things up and try submitting again.');
//		noticeService.push(noticeService.SUCCESS, 'Well done! You successfully read this important alert message.');
//		noticeService.push(noticeService.WARN, 'Oh snap! Change a few things up and try submitting again.');
//		noticeService.push(noticeService.INFO, 'Well done! You successfully read this important alert message.');
		
	}])
	;
