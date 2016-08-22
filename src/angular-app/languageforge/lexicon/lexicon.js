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
    'lexicon.services',
    'lexicon.filters',
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
        templateUrl: '/angular-app/languageforge/lexicon/views/import-export.html'
      })
      .state('settings', {
        url: '/settings',
        templateUrl: '/angular-app/languageforge/lexicon/views/settings.html'
      })
      ;

    // configure interface language file path
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/lexicon/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');
  }])
  .controller('LexiconCtrl', ['$scope', 'sessionService', 'lexConfigService', 'lexProjectService',
    '$translate', '$location', '$interval', 'silNoticeService', 'lexEditorDataService',
    'lexSendReceiveApi', 'lexSendReceive',
  function ($scope, sessionService, lexConfig, lexProjectService,
            $translate, $location, $interval, notice, editorService,
            sendReceiveApi, sendReceive) {
    var pristineLanguageCode;

    $scope.project = sessionService.session.project;
    $scope.projectSettings = sessionService.session.projectSettings;
    $scope.syncNotice = sendReceive.syncNotice;

    $scope.rights = {};
    $scope.rights.canRemoveUsers = function canRemoveUsers() {
      if (sendReceive.isInProgress()) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
        sessionService.operation.DELETE);
    };

    $scope.rights.canCreateUsers = function canCreateUsers() {
      if (sendReceive.isInProgress()) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
          sessionService.operation.CREATE);
    };

    $scope.rights.canEditUsers = function canEditUsers() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
          sessionService.operation.EDIT);
    };

    $scope.rights.canArchiveProject = function canArchiveProject() {
      if (sendReceive.isInProgress() || !angular.isDefined(sessionService.session.project))
        return false;

      return (sessionService.session.project.userIsProjectOwner ||
        sessionService.hasSiteRight(sessionService.domain.PROJECTS,
          sessionService.operation.ARCHIVE));
    };

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

    $scope.showSyncButton = function showSyncButton() {
      var isEditorView = ($location.path().indexOf('/editor/') == 0);
      return !$scope.project.isArchived && $scope.rights.canEditUsers() &&
        $scope.projectSettings.hasSendReceive && isEditorView;
    };

    $scope.disableSyncButton = function disableSyncButton() {
      return sendReceive.isStarted();
    };

    // Called when Send/Receive button clicked
    $scope.syncProject = function syncProject() {
      sendReceiveApi.receiveProject(function (result) {
        if (result.ok) {
          sendReceive.setSyncStarted();
        } else {
          notice.push(notice.ERROR,
            'The project could not be synchronized with LanguageDepot.org. Please try again.');
        }
      });
    };

    $scope.$on('$destroy', sendReceive.cancelAllStatusTimers);
    $scope.$on('$locationChangeStart', sendReceive.cancelAllStatusTimers);

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
