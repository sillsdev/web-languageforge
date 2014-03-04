'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon', 
		[
		 'ngRoute',
		 'dbe',
		 'meaning',
		 'examples',
		 'lexicon.add-meanings',
		 'lexicon.importExport',
		 'settings',
		 'lexicon.services',
		 'lexicon.filters',
		 'bellows.filters'
		])
	.config(['$routeProvider', function($routeProvider) {
		// the "projects" route is a hack to redirect to the /app/projects URL.  See "otherwise" route below
	    $routeProvider.when('/projects', { template: ' ', controller: function() { window.location.replace('/app/projects'); } });

		$routeProvider.when( '/p/:projectId', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/view', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/gatherTexts', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/review', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/p/:projectId/wordlist', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });

		$routeProvider.when(
				'/p/:projectId/dbe',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/dbe.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-grammar',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/add-grammar.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-examples',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/add-examples.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/add-meanings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/add-meanings.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/importExport',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/import-export.html',
				}
			);
		$routeProvider.when(
				'/p/:projectId/settings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/settings.html',
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
	.controller("MainCtrl", ['$scope', 'lexProjectService', function($scope, projectService) {
		$scope.hasProjectConfig = false;
		projectService.readSettings(function(result) {
			if (result.ok) {
				$scope.hasProjectConfig = true;
			}
		});
	}])
	.controller('LexiconMenuCtrl', ['$scope', '$timeout', 'lexProjectService', 
	                                function($scope, $timeout, lexProjectService) {
		$scope.noSubmenuId = 0;
		$scope.gatherSubmenuId = 1;
		$scope.addSubmenuId = 2;
		$scope.visibleSubmenu = $scope.noSubmenuId;
		
		$scope.showSubmenu = function(submenuId) {
			$scope.visibleSubmenu = submenuId;
		};
		$scope.isSubmenuVisible = function(submenuId) {
			return ($scope.visibleSubmenu == submenuId);
		};
		$scope.isItemVisible = function(itemName) {
			// Default to visible if config not defined
			if (angular.isUndefined($scope.config)) {
				return true;
			};
			// Default to invisible if nothing specified in config
			if (angular.isUndefined($scope.config.tasks[itemName])) {
				return false;
			};
			return $scope.config.tasks[itemName].visible;
		};
		$scope.hideAllSubmenus = function(delay) {
			// If no delay specified, undefined will work quite well since
			// the default delay in $timeout is 0 milliseconds.
			$scope.hidePromise = $timeout(function() {
				$scope.visibleSubmenu = $scope.noSubmenuId;
				delete $scope.hidePromise;
			}, delay);
		};
		$scope.cancelHiding = function() {
			if ($scope.hidePromise) {
				$timeout.cancel($scope.hidePromise);
			}
		};
		$scope.iconName = function(submenuId) {
			var name = 'icon-chevron-';
			if ($scope.isSubmenuVisible(submenuId)) {
				name += 'up';
			} else {
				name += 'down';
			};
			return name;
		};
		
		$scope.projectId = lexProjectService.getProjectId();
		
		lexProjectService.settingsChangeNotify(function() {
			$scope.config = lexProjectService.getSettings();
		});
		
	}])
	;
