'use strict';

// Declare app level module which depends on filters, and services
angular.module('sfchecks', 
		[
		 'sfchecks.filters', 
		 'sfchecks.services', 
		 'sfchecks.directives', 
		 'sfchecks.controllers'
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
    		'/project/:projectName/:projectId', 
    		{
    			templateUrl: '/angular-app/sfchecks/partials/project.html', 
    			controller: 'ProjectCtrl'
    		}
    	);
	    $routeProvider.when(
    		'/project/:projectName/:projectId/:textName/:textId', 
    		{
    			templateUrl: '/angular-app/sfchecks/partials/questions.html', 
    			controller: 'QuestionsCtrl'
    		}
    	);
	    $routeProvider.when(
    		'/project/:projectName/:projectId/:textName/:textId/:questionName/:questionId',
    		{
    			templateUrl: '/angular-app/sfchecks/partials/question.html', 
    			controller: 'QuestionCtrl'
			}
		);
	    $routeProvider.otherwise({redirectTo: 'projects'});
	}])
	;
