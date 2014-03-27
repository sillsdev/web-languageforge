'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon', 
		[
		 'ngRoute',
		 'dbe',
		 'meaning',
		 'examples',
		 'lexicon.add-meanings',
		 'lexicon.configuration',
		 'lexicon.importExport',
		 'lexicon.settings',
		 'lexicon.manageUsers',
		 'lexicon.services',
		 'lexicon.filters',
		 'bellows.filters'
		])
	.config(['$routeProvider', function($routeProvider) {
		// the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
	    $routeProvider.when('/projects', { template: ' ', controller: function() { window.location.replace('/app/projects'); } });

		$routeProvider.when( '/p/:projectId', { redirectTo: '/p/:projectId/dbe', });
		$routeProvider.when( '/p/:projectId/view', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/gatherTexts', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/review', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/wordlist', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });

		$routeProvider.when(
				'/p/:projectId/dbe',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-grammar',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-examples',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-meanings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/importExport',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/import-export.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/configuration',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/configuration.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/settings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/settings.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/users',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/manageUsers.html',
				}
			);
	    $routeProvider.otherwise({redirectTo: '/projects'});
	}])
	.controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService', function($scope, $rootScope, breadcrumbService) {
		$scope.idmap = breadcrumbService.idmap;
		$rootScope.$on('$routeChangeSuccess', function(event, current) {
			$scope.breadcrumbs = breadcrumbService.read();
		});
		$scope.$watch('idmap', function(oldVal, newVal, scope) {
			$scope.breadcrumbs = breadcrumbService.read();
		}, true);
	}])
	.controller('LexiconMenuCtrl', ['$scope', '$timeout', 'lexConfigService', 'lexProjectService', 
	                                function($scope, $timeout, lexConfigService, lexProjectService) {
		$scope.isItemVisible = function(itemName) {
			// Default to visible if config not defined
			if (angular.isUndefined($scope.config)) {
				return false;
			};
			// Default to invisible if nothing specified in config
			if (angular.isUndefined($scope.config.tasks[itemName])) {
				return false;
			};
			return $scope.config.tasks[itemName].visible;
		};
		
		$scope.projectId = lexProjectService.getProjectId();
		
		lexConfigService.registerListener(function() {
			$scope.config = lexConfigService.getConfig();
		});
	}])
	;
