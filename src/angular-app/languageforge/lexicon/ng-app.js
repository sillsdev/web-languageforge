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
		'lexicon.import-export',
		'lexicon.settings',
		'lexicon.manage-users',
		'lexicon.services',
		'lexicon.filters',
		 'bellows.filters',
		 'pascalprecht.translate' 
	])
	.config(['$routeProvider', '$translateProvider', function($routeProvider, $translateProvider) {
		// configure interface language filepath
		$translateProvider.useStaticFilesLoader({
			prefix: '/angular-app/languageforge/lexicon/lang/',
			suffix: '.json'
		});
		$translateProvider.preferredLanguage('en');
		
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
					templateUrl: '/angular-app/languageforge/lexicon/views/manage-users.html',
				}
			);
		$routeProvider.otherwise({redirectTo: '/projects'});
	}])
	.controller('MainCtrl', ['$scope', 'lexBaseViewService', 'lexProjectService', '$translate', function($scope, lexBaseViewService, lexProjectService, $translate) {
		$scope.interfaceConfig = {};
		$scope.interfaceConfig.userLanguageCode = 'en;';
		$scope.interfaceConfig.selectLanguages = {
			'optionsOrder': ['en'],
			'options': { 'en': 'English' }
		};
		
		lexBaseViewService.registerListener(function() {
			var baseViewData = lexBaseViewService.getData();
			$scope.interfaceConfig = baseViewData.interfaceConfig;
		});
		
		$scope.$watch('interfaceConfig.userLanguageCode', function(newVal, scope) {
			if (newVal) {
				var user = {};
				user.id = '';
				user.interfaceLanguageCode = $scope.interfaceConfig.userLanguageCode;
				$translate.use(newVal);
				
				lexProjectService.updateUserProfile(user, function(result) {
					if (result.ok) {
						;// notice.push(notice.SUCCESS, $scope.project.projectname + " settings updated successfully");
					}
				});
			}
		});
		
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
	.controller('LexiconMenuCtrl', ['$scope', 'lexBaseViewService', 'lexProjectService', 
	                                function($scope, lexBaseViewService, lexProjectService) {
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
		
		lexBaseViewService.registerListener(function() {
			$scope.config = lexBaseViewService.getConfig();
		});
		
	}])
	;
