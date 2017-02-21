'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon',
  [
    'ui.router',
    'ui.bootstrap',
    'ngAnimate',
    'ngSanitize',
    'palaso.ui.dc.rendered',
    'palaso.ui.typeahead',
    'bellows.services',
    'bellows.filters',
    'lexicon.editor',
    'lexicon.configuration',
    'lexicon.view.settings',
    'lexicon.import-export',
    'lexicon.settings',
    'lexicon.sync',
    'lexicon.services',
    'pascalprecht.translate'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function ($stateProvider, $urlRouterProvider, $translateProvider) {
    $urlRouterProvider.otherwise('/editor/list');

    // State machine from ui.router
    $stateProvider
      .state('configuration', {
        url: '/configuration',
        templateUrl: '/angular-app/languageforge/lexicon/views/configuration.html'
      })
      .state('viewSettings', {
        url: '/viewSettings',
        templateUrl: '/angular-app/languageforge/lexicon/views/view-settings.html'
      })
      .state('importExport', {
        url: '/importExport',
        templateUrl: '/angular-app/languageforge/lexicon/views/' + bootstrapVersion + '/import-export.html'
      })
      .state('settings-project', {
        url: '/settings-project',
        templateUrl: '/angular-app/languageforge/lexicon/views/' + bootstrapVersion + '/settings.html',
        controller: function($scope) {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-project']").tab("show");
        }
      })
      .state('settings-archive', {
        url: '/settings-archive',
        templateUrl: '/angular-app/languageforge/lexicon/views/' + bootstrapVersion + '/settings.html',
        controller: function($scope) {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-archive']").tab("show");
        }
      })
      .state('settings-delete', {
        url: '/settings-delete',
        templateUrl: '/angular-app/languageforge/lexicon/views/' + bootstrapVersion + '/settings.html',
        controller: function($scope) {
          jQuery("#app-container-for-bootstrap .nav-tabs a[href='#settings-delete']").tab("show");
        }
      })
      .state('sync', {
        url: '/sync',
        templateUrl: '/angular-app/languageforge/lexicon/views/sync.html'
      })
      ;

    // configure interface language file path
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/lexicon/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
  }])
  .controller('LexiconCtrl', ['$scope', 'sessionService', 'lexConfigService', 'lexProjectService',
    '$translate', '$location', '$interval', 'silNoticeService', 'lexEditorDataService',
    'lexSendReceiveApi', 'lexSendReceive', 'lexRightsService',
  function ($scope, sessionService, lexConfig, lexProjectService,
            $translate, $location, $interval, notice, editorService,
            sendReceiveApi, sendReceive, rights) {
    var pristineLanguageCode;

    $scope.project = sessionService.session.project;

    $scope.rights = rights;
    $scope.rights.showControlBar = function showControlBar() {
      return $scope.rights.canRemoveUsers() || $scope.rights.canCreateUsers() ||
        $scope.rights.canEditUsers();
    };

    $scope.finishedLoading = false;
    editorService.loadEditorData().then(function () {
      $scope.finishedLoading = true;
      sendReceive.checkInitialState();
    });

    $scope.currentUserRole = sessionService.session.projectSettings.currentUserRole;
    $scope.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
    pristineLanguageCode = angular.copy($scope.interfaceConfig.userLanguageCode);
    changeInterfaceLanguage($scope.interfaceConfig.userLanguageCode);

    $scope.gotoDictionary = function gotoDictionary() {
      $location.path('/editor/list');
    };

    $scope.showDictionaryButton = function showDictionaryButton() {
      return !($location.path().indexOf('/editor') == 0);
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
    }

    $scope.$watch('interfaceConfig.userLanguageCode', function (newVal) {
      if (newVal && newVal != pristineLanguageCode) {
        var user = {};
        user.interfaceLanguageCode = newVal;

        lexProjectService.updateUserProfile(user);

        changeInterfaceLanguage(newVal);
      }
    });

    $scope.showSync = function showSync() {
      return !$scope.project.isArchived && rights.canEditUsers() &&
        sessionService.session.projectSettings.hasSendReceive;
    };

    $scope.$on('$destroy', sendReceive.cancelAllStatusTimers);

    // setup offline.js options
    // see https://github.com/hubspot/offline for all options
    // we tell offline.js to NOT store and remake requests while the connection is down
    Offline.options.requests = false;
    Offline.options.checkOnLoad = true;
    Offline.options.checks = { xhr: { url: '/offlineCheck.txt' } };

    var offlineMessageId;
    Offline.on('up', function () {
      if ($scope.online == false) {
        notice.removeById(offlineMessageId);
        notice.push(notice.SUCCESS, 'You are back online!');
      }

      $scope.online = true;
      $scope.$digest();
    });

    Offline.on('down', function () {
      offlineMessageId = notice.push(notice.ERROR,
        'You are offline.  Some features are not available', null, true);
      $scope.online = false;
      if (!/^\/editor\//.test($location.path())) {
        // redirect to the editor
        $location.path('/editor');
        notice.push(notice.SUCCESS,
          'The dictionary editor is available offline.  Settings are not.');
      }

      $scope.$digest();
    });

  }])
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService',
  function ($scope, $rootScope, breadcrumbService) {
    $scope.idmap = breadcrumbService.idmap;
    $rootScope.$on('$routeChangeSuccess', function () {
      $scope.breadcrumbs = breadcrumbService.read();
    });

    $scope.$watch('idmap', function () {
      $scope.breadcrumbs = breadcrumbService.read();
    }, true);
  }])

  ;
