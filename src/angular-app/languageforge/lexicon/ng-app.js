'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon', 
	[
		'ngRoute',
		'dbe',
		'meaning',
		'examples',
		'bellows.services',
		'bellows.filters',
		'lexicon.add-meanings',
		'lexicon.configuration',
		'lexicon.view.settings',
		'lexicon.import-export',
		'lexicon.settings',
		'lexicon.manage-users',
		'lexicon.services',
		'lexicon.filters',
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
		
		$routeProvider.when( '/', { redirectTo: '/dbe', });
		$routeProvider.when( '/view', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/gatherTexts', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/review', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		$routeProvider.when( '/wordlist', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html', });
		
		$routeProvider.when(
				'/dbe',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
				}
			);
        $routeProvider.when(
            '/dbe/:entryId',
            {
                templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
            }
        );
        $routeProvider.when(
            '/dbe/:entryId/comments',
            {
                templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
            }
        );
		$routeProvider.when(
				'/add-grammar',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/add-examples',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/add-meanings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/edit.html',
				}
			);
		$routeProvider.when(
				'/configuration',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/configuration.html',
				}
			);
		$routeProvider.when(
				'/viewSettings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/view-settings.html',
				}
			);
		$routeProvider.when(
				'/importExport',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/import-export.html',
				}
			);
		$routeProvider.when(
				'/settings',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/settings.html',
				}
			);
		$routeProvider.when(
				'/users',
				{
					templateUrl: '/angular-app/languageforge/lexicon/views/manage-users.html',
				}
			);
		$routeProvider.otherwise({redirectTo: '/projects'});
	}])
	.controller('MainCtrl', ['$scope', 'sessionService', 'lexProjectService', '$translate',
    function($scope, ss, lexProjectService, $translate) {

		$scope.rights = {};
		$scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE); 
		$scope.rights.create = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE); 
		$scope.rights.edit = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
		$scope.rights.showControlBar = $scope.rights.remove || $scope.rights.create || $scope.rights.edit;
	    $scope.entries = []; // persist the entries array across all controllers
		$scope.project = ss.session.project;
		$scope.projectSettings = ss.session.projectSettings;
        $scope.config = $scope.projectSettings.config;
		$scope.currentUserRole = ss.session.projectSettings.currentUserRole;
		$scope.interfaceConfig = ss.session.projectSettings.interfaceConfig;
		var pristineLanguageCode = angular.copy($scope.interfaceConfig.userLanguageCode);
		changeInterfaceLanguage($scope.interfaceConfig.userLanguageCode);


		$scope.isTaskEnabled = function isTaskEnabled(taskName) {
			// Default to visible if nothing specified in config
			if (angular.isUndefined($scope.config.roleViews[$scope.currentUserRole].showTasks[taskName])) {
				return true;
			};
			return $scope.config.roleViews[$scope.currentUserRole].showTasks[taskName];
		};


        $scope.isFieldEnabled = function isFieldEnabled(fieldName) {
            // Default to visible if nothing specified in config
            if (angular.isUndefined($scope.config.roleViews[$scope.currentUserRole].showFields[fieldName])) {
                return true;
            };
            return $scope.config.roleViews[$scope.currentUserRole].showFields[fieldName];
        };


		
		function changeInterfaceLanguage(code) {
			$translate.use(code);
			pristineLanguageCode = angular.copy(code);
			
			if (InputSystems.isRightToLeft(code)) {
				$scope.interfaceConfig.direction = 'rtl';
				$scope.interfaceConfig.pullToSide = 'pull-left';
				$scope.interfaceConfig.pullNormal = 'pull-right';
				$scope.interfaceConfig.placementToSide = 'right';
				$scope.interfaceConfig.placementNormal = 'left';
			} else {
				$scope.interfaceConfig.direction = 'ltr';
				$scope.interfaceConfig.pullToSide = 'pull-right';
				$scope.interfaceConfig.pullNormal = 'pull-left';
				$scope.interfaceConfig.placementToSide = 'left';
				$scope.interfaceConfig.placementNormal = 'right';
			}
		};


		
		$scope.$watch('interfaceConfig.userLanguageCode', function(newVal, oldVal) {
			if (newVal && newVal != pristineLanguageCode) {
				var user = {};
				user.interfaceLanguageCode = newVal;
				
				lexProjectService.updateUserProfile(user, function(result) {
					if (result.ok) {
//						console.log("Interface langauge changed successfully: " + newVal);
					}
				});
				changeInterfaceLanguage(newVal);
			}
		});
		
	}])
	.controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService', function($scope, $rootScope, breadcrumbService) {
		$scope.idmap = breadcrumbService.idmap;
		$rootScope.$on('$routeChangeSuccess', function(event, current) {
			$scope.breadcrumbs = breadcrumbService.read();
		});
		$scope.$watch('idmap', function(newVal, oldVal, scope) {
			$scope.breadcrumbs = breadcrumbService.read();
		}, true);
	}])
	;
