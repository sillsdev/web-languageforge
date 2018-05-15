'use strict';

// Declare app level module which depends on filters, and services
angular.module('lexicon',
  [
    'ui.router',
    'ui.bootstrap',
    'ngSanitize',
    'palaso.ui.typeahead',
    'coreModule',
    'sgw.ui.breadcrumb',
    'lexiconCoreModule',
    'lexicon.editor',
    'lexiconSettingsModule',
    'language.inputSystems',
    'pascalprecht.translate'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider', '$compileProvider',
    '$sanitizeProvider', 'apiServiceProvider',
    function ($stateProvider, $urlRouterProvider, $translateProvider, $compileProvider,
      $sanitizeProvider, apiService) {
    $compileProvider.debugInfoEnabled(apiService.isProduction);
    $compileProvider.commentDirectivesEnabled(apiService.isProduction);

    // this is needed to allow style="font-family" on ng-bind-html elements
    $sanitizeProvider.addValidAttrs(['style']);

    $urlRouterProvider.otherwise('/editor/list');

    // State machine from ui.router
    $stateProvider
      .state('configuration', {
        url: '/configuration',
        template: '<lexicon-config></lexicon-config>'
      })
      .state('importExport', {
        url: '/importExport',
        template: '<lexicon-import></lexicon-import>'
      })
      .state('settings', {
        url: '/settings',
        template: '<lexicon-project-settings lps-project="project"' +
          ' lps-rights="rights"' +
          ' lps-interface-config="interfaceConfig"' +
          ' lps-on-update="onUpdate($event)"></lexicon-project-settings>'
      })
      .state('sync', {
        url: '/sync',
        template: '<lexicon-sync></lexicon-sync>'
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
    'lexSendReceiveApi', 'lexSendReceive', 'lexRightsService', '$q', 'inputSystems',
  function ($scope, sessionService, lexConfig, lexProjectService,
            $translate, $location, $interval, notice, editorService,
            sendReceiveApi, sendReceive, rightsService, $q, inputSystemsService) {
    var pristineLanguageCode;

    $scope.finishedLoading = false;
    editorService.loadEditorData($scope).then(function () {
      $scope.finishedLoading = true;
      sendReceive.checkInitialState();
    });

    $q.all([sessionService.getSession(), rightsService.getRights()]).then(function (data) {
      var session = data[0];
      var rights = data[1];

      $scope.project = session.project();
      $scope.rights = rights;
      $scope.rights.showControlBar = function showControlBar() {
        return $scope.rights.canRemoveUsers() || $scope.rights.canCreateUsers() ||
          $scope.rights.canEditUsers();
      };

      $scope.showSync = function showSync() {
        return !$scope.project.isArchived && rights.canEditUsers() &&
          session.projectSettings().hasSendReceive;
      };

      $scope.optionLists = session.projectSettings().optionlists;
      $scope.currentUserRole = session.projectSettings().currentUserRole;
      $scope.interfaceConfig = session.projectSettings().interfaceConfig;
      pristineLanguageCode = angular.copy($scope.interfaceConfig.userLanguageCode);
      changeInterfaceLanguage($scope.interfaceConfig.userLanguageCode);

      $scope.gotoDictionary = function gotoDictionary() {
        $location.path('/editor/list');
      };

      $scope.showDictionaryButton = function showDictionaryButton() {
        return !($location.path().indexOf('/editor') === 0);
      };

      $scope.onUpdate = function onUpdate($event) {
        if ($event.project) {
          $scope.project = $event.project;
        }
      };

      function changeInterfaceLanguage(code) {
        $translate.use(code);
        pristineLanguageCode = angular.copy(code);

        if (inputSystemsService.constructor.isRightToLeft(code)) {
          $scope.interfaceConfig.direction = 'rtl';
          $scope.interfaceConfig.pullToSide = 'float-left';
          $scope.interfaceConfig.pullNormal = 'float-right';
          $scope.interfaceConfig.placementToSide = 'right';
          $scope.interfaceConfig.placementNormal = 'left';
        } else {
          $scope.interfaceConfig.direction = 'ltr';
          $scope.interfaceConfig.pullToSide = 'float-right';
          $scope.interfaceConfig.pullNormal = 'float-left';
          $scope.interfaceConfig.placementToSide = 'left';
          $scope.interfaceConfig.placementNormal = 'right';
        }
      }

      $scope.$watch('interfaceConfig.userLanguageCode', function (newVal) {
        if (newVal && newVal !== pristineLanguageCode) {
          var user = {};
          user.interfaceLanguageCode = newVal;

          lexProjectService.updateUserProfile(user);

          changeInterfaceLanguage(newVal);
        }
      });

      $scope.$on('$destroy', sendReceive.cancelAllStatusTimers);

      // setup offline.js options
      // see https://github.com/hubspot/offline for all options
      // we tell offline.js to NOT store and remake requests while the connection is down
      Offline.options.requests = false;
      Offline.options.checkOnLoad = true;
      Offline.options.checks = { xhr: { url: '/offlineCheck.txt' } };

      // Set the page's Language Forge title, font size, and nav's background color
      function setTitle(text, fontSize, backgroundColor) {
        var title = document.querySelector('nav .mobile-title a');
        title.textContent = text;
        title.style.fontSize = fontSize;

        document.querySelector('nav a.navbar-brand').textContent = text;

        document.querySelector('nav.navbar').style.backgroundColor = backgroundColor;
      }

      var offlineMessageId;
      Offline.on('up', function () {
        setTitle('Language Forge', '', '');

        if ($scope.online === false) {
          notice.removeById(offlineMessageId);
          notice.push(notice.SUCCESS, 'You are back online!');
        }

        $scope.online = true;
        $scope.$digest();
      });

      Offline.on('down', function () {
        setTitle('Language Forge Offline', '0.8em', '#555');
        offlineMessageId = notice.push(notice.ERROR,
          'You are offline. Some features are not available', null, true, 5 * 1000);
        $scope.online = false;
        if (!/^\/editor\//.test($location.path())) {
          // redirect to the editor
          $location.path('/editor');
          notice.push(notice.SUCCESS,
            'The dictionary editor is available offline.  Settings are not.');
        }

        $scope.$digest();
      });
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
