'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon',
  [
    'ngRoute',
    'ngSanitize',
    'lexicon.edit',
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

    $routeProvider.when('/', { redirectTo: '/dbe' });
    $routeProvider.when('/view', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/gatherTexts', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/review', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/wordlist', { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });

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
        templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
      }
    );
    $routeProvider.when(
      '/add-examples',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
      }
    );
    $routeProvider.when(
      '/add-meanings',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/edit.html'
      }
    );
    $routeProvider.when(
      '/configuration',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/configuration.html'
      }
    );
    $routeProvider.when(
      '/viewSettings',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/view-settings.html'
      }
    );
    $routeProvider.when(
      '/importExport',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/import-export.html'
      }
    );
    $routeProvider.when(
      '/settings',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/settings.html'
      }
    );
    $routeProvider.when(
      '/users',
      {
        templateUrl: '/angular-app/languageforge/lexicon/views/manage-users.html'
      }
    );
    $routeProvider.otherwise({ redirectTo: '/projects' });
  }])
  .controller('MainCtrl', ['$scope', 'sessionService', 'lexConfigService', 'lexProjectService', '$translate', '$location', '$interval', 'silNoticeService', 'lexEditorDataService', 'lexSendReceiveService',
  function($scope, ss, lexConfigService, lexProjectService, $translate, $location, $interval, noticeService, editorService, sendReceiveService) {
    var pristineLanguageCode;

    $scope.rights = {};
    $scope.rights.remove = ss.hasProjectRight(ss.domain.USERS, ss.operation.DELETE);
    $scope.rights.create = ss.hasProjectRight(ss.domain.USERS, ss.operation.CREATE);
    $scope.rights.edit = ss.hasProjectRight(ss.domain.USERS, ss.operation.EDIT);
    $scope.rights.showControlBar = $scope.rights.remove || $scope.rights.create || $scope.rights.edit;
    $scope.project = ss.session.project;
    $scope.projectSettings = ss.session.projectSettings;
    $scope.sendReceive = $scope.projectSettings.sendReceive || {};

    // persist the entries and comments array across all controllers

    $scope.finishedLoading = false;
    editorService.loadEditorData().then(function() {
      $scope.finishedLoading = true;

      if (!$scope.sendReceive.status) {
        $scope.sendReceive.status = {};
        $scope.sendReceive.status.SRState = '';
        getProjectStatus();
        startSyncStatusTimer();
      } else if ($scope.sendReceive.status.SRState == 'IDLE') {
        $scope.sendReceive.status.SRState = '';
      } else if ($scope.sendReceive.status.SRState != 'HOLD') {
        getProjectStatus();
        startSyncStatusTimer();
      }
    });

    $scope.currentUserRole = ss.session.projectSettings.currentUserRole;
    $scope.interfaceConfig = ss.session.projectSettings.interfaceConfig;
    pristineLanguageCode = angular.copy($scope.interfaceConfig.userLanguageCode);
    changeInterfaceLanguage($scope.interfaceConfig.userLanguageCode);

    $scope.isTaskEnabled = lexConfigService.isTaskEnabled;

    $scope.gotoDictionary = function gotoDictionary() {
      $location.path('/dbe');
    };

    $scope.showDictionaryButton = function showDictionaryButton() {
      return !($location.path().indexOf('/dbe') == 0);
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

    $scope.$watch('interfaceConfig.userLanguageCode', function(newVal) {
      if (newVal && newVal != pristineLanguageCode) {
        var user = {};
        user.interfaceLanguageCode = newVal;

        lexProjectService.updateUserProfile(user);

        changeInterfaceLanguage(newVal);
      }
    });

    $scope.showSyncButton = function showSyncButton() {
      var isDbeView = ($location.path().indexOf('/dbe') == 0);
      return $scope.rights.edit && $scope.projectSettings.hasSendReceive && isDbeView;
    };

    $scope.syncNotice = function syncNotice() {
      if (angular.isUndefined($scope.sendReceive) || angular.isUndefined($scope.sendReceive.status)) return;
      switch ($scope.sendReceive.status.SRState) {
        case 'QUEUED':
        case 'MERGING':
        case 'SENDING':
        case 'RECEIVING':
        case 'UPDATING':
        case 'syncing':
          return 'Syncing...';
        case 'IDLE':
        case 'synced':
          return 'Synced';
        case 'unsynced':
          return 'Un-synced';
        case 'HOLD':
          return 'On hold';
        default:
          return '';
      }
    };

    $scope.syncProject = function syncProject() {
      sendReceiveService.receiveProject(function(result) {
        if (result.ok) {
          $scope.sendReceive.status.SRState = 'syncing';
          startSyncStatusTimer();
        } else {
          noticeService.push(noticeService.ERROR, 'The project could not be synchronized with LanguageDepot.org. Please try again.');
        }
      });
    };

    var syncStatusTimer;

    function getProjectStatus() {
      sendReceiveService.getProjectStatus(function(result) {
        if (result.ok) {
          if (!result.data) {
            $scope.sendReceive.status.SRState = '';
            cancelSyncStatusTimer();
            return;
          }

          $scope.sendReceive.status = result.data;
          if ($scope.sendReceive.status.SRState == 'IDLE' || $scope.sendReceive.status.SRState == 'HOLD') {
            cancelSyncStatusTimer();
          }

          console.log($scope.sendReceive.status);

          if ($scope.sendReceive.status.SRState == 'IDLE') {
            $scope.finishedLoading = false;
            editorService.loadEditorData().then(function () {
              $scope.finishedLoading = true;
            });
          }
        }
      });
    }

    function startSyncStatusTimer() {
      if (angular.isDefined(syncStatusTimer)) return;

      syncStatusTimer = $interval(getProjectStatus, 3000);
    }

    function cancelSyncStatusTimer() {
      if (angular.isDefined(syncStatusTimer)) {
        $interval.cancel(syncStatusTimer);
        syncStatusTimer = undefined;
      }
    }

    $scope.$on('$destroy', cancelSyncStatusTimer);
    $scope.$on('$locationChangeStart', cancelSyncStatusTimer);

    // setup offline.js options
    // see https://github.com/hubspot/offline for all options
    // we tell offline.js to NOT store and remake requests while the connection is down
    Offline.options.requests = false;
    Offline.options.checkOnLoad = true;
    Offline.options.checks = { xhr: { url: '/offlineCheck.txt' } };

    var offlineMessageId;
    Offline.on('up', function() {
      if ($scope.online == false) {
        noticeService.removeById(offlineMessageId);
        noticeService.push(noticeService.SUCCESS, 'You are back online!');
      }

      $scope.online = true;
      $scope.$digest();
    });

    Offline.on('down', function() {
      offlineMessageId = noticeService.push(noticeService.ERROR, 'You are offline.  Some features are not available', null, true);
      $scope.online = false;
      if (!/^dbe/.test($location.path())) {
        // redirect to the dbe
        $location.path('/dbe');
        noticeService.push(noticeService.SUCCESS, 'The dictionary editor is available offline.  Settings are not.');
      }

      $scope.$digest();
    });

  }])
  .controller('BreadcrumbCtrl', ['$scope', '$rootScope', 'breadcrumbService', function($scope, $rootScope, breadcrumbService) {
    $scope.idmap = breadcrumbService.idmap;
    $rootScope.$on('$routeChangeSuccess', function() {
      $scope.breadcrumbs = breadcrumbService.read();
    });

    $scope.$watch('idmap', function() {
      $scope.breadcrumbs = breadcrumbService.read();
    }, true);
  }])

  ;
