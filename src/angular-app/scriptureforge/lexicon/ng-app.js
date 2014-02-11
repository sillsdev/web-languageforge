'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon', 
		[
		 'ngRoute',
		 'dbe',
		 'settings'
		])
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when(
				'/view',
				{
					templateUrl: '/angular-app/lexicon/views/not-implemented.html',
					// controller: 'dbeCtrl'
				}
			);
		$routeProvider.when(
				'/dashboard',
				{
					templateUrl: '/angular-app/lexicon/views/not-implemented.html',
					// controller: 'dashboardCtrl'
				}
			);
		$routeProvider.when(
				'/gather-words',
				{
					templateUrl: '/angular-app/lexicon/views/not-implemented.html',
				}
			);
		$routeProvider.when(
				'/dbe',
				{
					templateUrl: '/angular-app/lexicon/views/dbe.html',
					controller: 'dbeCtrl'
				}
			);
		$routeProvider.when(
				'/settings',
				{
					templateUrl: '/angular-app/lexicon/views/settings.html',
					controller: 'SettingsCtrl'
				}
			);
		$routeProvider.otherwise({redirectTo: '/dashboard'});
	}])
	.controller('MainCtrl', ['$scope', '$route', '$routeParams', '$location', function($scope, $route, $routeParams, $location) {
		$scope.route = $route;
		$scope.location = $location;
		$scope.routeParams = $routeParams;
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
	.controller('LexiconMenuCtrl', ['$scope', '$timeout', function($scope, $timeout) {
		console.log('Running lexicon menu controller');
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
		}
		$scope.iconName = function(submenuId) {
			var name = 'icon-chevron-';
			if ($scope.isSubmenuVisible(submenuId)) {
				name += 'up';
			} else {
				name += 'down';
			};
			return name;
		}
	}])
	;
