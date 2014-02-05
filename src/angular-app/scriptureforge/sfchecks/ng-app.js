'use strict';

// Declare app level module which depends on filters, and services
angular.module('sfchecks', 
		[
		 'ngRoute',
		 'ngSanitize',
		 'sfchecks.projects',
		 'sfchecks.project',
		 'sfchecks.projectSettings',
		 'sfchecks.questions',
		 'sfchecks.question',
		 'sfchecks.filters',
		 'palaso.ui.notice',
		 'sf.ui.invitefriend'
		])
	.config(['$routeProvider', function($routeProvider) {
	    $routeProvider.when(
    		'/projects', 
    		{
    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/projects.html', 
    			controller: 'ProjectsCtrl'
    		}
	    );
	    $routeProvider.when(
    		'/project/:projectId', 
    		{
    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/project.html', 
    			controller: 'ProjectCtrl'
    		}
    	);
	    $routeProvider.when(
	    		'/project/:projectId/settings', 
	    		{
	    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/projectSettings.html', 
	    			controller: 'ProjectSettingsCtrl'
	    		}
	    	);
	    $routeProvider.when(
    		'/project/:projectId/:textId', 
    		{
    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/questions.html', 
    			controller: 'QuestionsCtrl'
    		}
    	);
	    $routeProvider.when(
	    		'/project/:projectId/:textId/settings', 
	    		{
	    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/questions-settings.html', 
	    			controller: 'QuestionsSettingsCtrl'
	    		}
	    	);
	    $routeProvider.when(
    		'/project/:projectId/:textId/:questionId',
    		{
    			templateUrl: '/angular-app/scriptureforge/sfchecks/partials/question.html', 
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
	}])
	;
