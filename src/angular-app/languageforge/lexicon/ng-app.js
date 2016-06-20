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
  .config(['$routeProvider', '$translateProvider', function ($routeProvider, $translateProvider) {

    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/lexicon/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');

    // The "projects" route is a hack to redirect to the /app/projects URL.
    // See "otherwise" route below
    $routeProvider.when('/projects', { template: ' ', controller: function () {
      window.location.replace('/app/projects'); } });

    $routeProvider.when('/', { redirectTo: '/dbe' });
    $routeProvider.when('/view',
      { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/gatherTexts',
      { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/review',
      { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });
    $routeProvider.when('/wordlist',
      { templateUrl: '/angular-app/languageforge/lexicon/views/not-implemented.html' });

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
    $routeProvider.otherwise({ redirectTo: '/dbe' });
  }])
  .controller('MainCtrl', ['$scope', 'sessionService', 'lexConfigService', 'lexProjectService',
    '$translate', '$location', '$interval', 'silNoticeService', 'lexEditorDataService',
    'lexSendReceiveApi', 'lexSendReceive',
  function ($scope, sessionService, lexConfig, lexProjectService,
            $translate, $location, $interval, notice, editorService,
            sendReceiveApi, sendReceive) {
    var pristineLanguageCode;

    $scope.project = sessionService.session.project;
    $scope.projectSettings = sessionService.session.projectSettings;
    $scope.syncNotice = sendReceive.syncNotice;
    sendReceive.setSyncProjectStatusSuccessCallback(projectStatusSuccess);

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
      if (sendReceive.isInProgress()) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
          sessionService.operation.EDIT);
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

    $scope.$watch('interfaceConfig.userLanguageCode', function (newVal) {
      if (newVal && newVal != pristineLanguageCode) {
        var user = {};
        user.interfaceLanguageCode = newVal;

        lexProjectService.updateUserProfile(user);

        changeInterfaceLanguage(newVal);
      }
    });

    $scope.showSyncButton = function showSyncButton() {
      var isDbeView = ($location.path().indexOf('/dbe') == 0);
      return $scope.rights.canEditUsers() && $scope.projectSettings.hasSendReceive && isDbeView;
    };

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

    function projectStatusSuccess() {
      //$scope.finishedLoading = false;
      editorService.loadEditorData().then(function () {
        //$scope.finishedLoading = true;
        sessionService.refresh(lexConfig.refresh);
      });
    }

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
      if (!/^dbe/.test($location.path())) {
        // redirect to the dbe
        $location.path('/dbe');
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
