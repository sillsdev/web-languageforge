import * as angular from 'angular';
import uiRouter from 'angular-ui-router';

import {ApiService} from '../../bellows/core/api/api.service';
import {BreadcrumbModule} from '../../bellows/core/breadcrumbs/breadcrumb.module';
import {CoreModule} from '../../bellows/core/core.module';
import {InputSystemsService} from '../../bellows/core/input-systems/input-systems.service';
import {NoticeService} from '../../bellows/core/notice/notice.service';
import {SessionService} from '../../bellows/core/session.service';
import {User} from '../../bellows/shared/model/user.model';
import {LexiconConfigService} from './core/lexicon-config.service';
import {LexiconCoreModule} from './core/lexicon-core.module';
import {LexiconEditorDataService} from './core/lexicon-editor-data.service';
import {LexiconProjectService} from './core/lexicon-project.service';
import {LexiconRightsService} from './core/lexicon-rights.service';
import {LexiconSendReceiveApiService} from './core/lexicon-send-receive-api.service';
import {LexiconSendReceiveService} from './core/lexicon-send-receive.service';
import {LexiconEditorModule} from './editor/editor.module';
import {LexiconSettingsModule} from './settings/settings.module';
import {LexiconConfig} from './shared/model/lexicon-config.model';
import {LexiconProjectSettings} from './shared/model/lexicon-project-settings.model';
import {LexiconProject} from './shared/model/lexicon-project.model';
import {LexOptionList} from './shared/model/option-list.model';

// Declare app level module which depends on filters, and services
export const LexiconAppComponentModule = angular
  .module('lexicon', [
    'ui.bootstrap',
    uiRouter,
    'ngSanitize',
    'palaso.ui.typeahead',
    CoreModule,
    BreadcrumbModule,
    LexiconCoreModule,
    LexiconEditorModule,
    LexiconSettingsModule
  ])
  .config(['$stateProvider', '$urlRouterProvider',
    '$compileProvider', '$sanitizeProvider', 'apiServiceProvider',
    ($stateProvider: angular.ui.IStateProvider, $urlRouterProvider: angular.ui.IUrlRouterProvider,
     $compileProvider: angular.ICompileProvider, $sanitizeProvider: any, apiService: ApiService) => {

    $compileProvider.debugInfoEnabled(apiService.isProduction);
    $compileProvider.commentDirectivesEnabled(apiService.isProduction);

    // this is needed to allow style="font-family" on ng-bind-html elements
    $sanitizeProvider.addValidAttrs(['style']);

    $urlRouterProvider.otherwise('/editor/list');

    // State machine from ui.router
    $stateProvider
      .state('configuration', {
        url: '/configuration',
        template: '<lexicon-config lsc-config="config"' +
          ' lsc-option-lists="optionLists"' +
          ' lsc-users="users"' +
          ' lsc-on-update="onUpdate($event)"></lexicon-config>'
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
        template: '<lexicon-sync lsy-rights="rights"></lexicon-sync>'
      })
      ;

  }])
  .controller('LexiconCtrl', ['$scope', '$interval', '$location', '$q',
    'silNoticeService', 'sessionService', 'lexConfigService',
    'lexProjectService', 'lexEditorDataService',
    'lexRightsService', 'lexSendReceiveApi',
    'lexSendReceive',
    ($scope: any, $interval: angular.IIntervalService, $location: angular.ILocationService, $q: angular.IQService,
     notice: NoticeService, sessionService: SessionService, configService: LexiconConfigService,
     lexProjectService: LexiconProjectService, editorService: LexiconEditorDataService,
     rightsService: LexiconRightsService, sendReceiveApi: LexiconSendReceiveApiService,
     sendReceive: LexiconSendReceiveService) => {

    let pristineLanguageCode: string;

    $scope.finishedLoading = false;
    editorService.loadEditorData($scope).then(() => {
      $scope.finishedLoading = true;
      sendReceive.checkInitialState();
    });

    $q.all([rightsService.getRights(), configService.getEditorConfig()]).then(([rights, editorConfig]) => {
      if (rights.canEditProject()) {
        lexProjectService.users().then(result => {
          if (result.ok) {
            const users = {};
            for (const user of (result.data.users as User[])) {
              users[user.id] = user;
            }

            $scope.users = users;
          }
        });
      }

      $scope.editorConfig = editorConfig;
      $scope.project = rights.session.project();
      $scope.config = rights.session.projectSettings<LexiconProjectSettings>().config;
      $scope.optionLists = rights.session.projectSettings<LexiconProjectSettings>().optionlists;
      $scope.rights = rights;
      $scope.rights.showControlBar = function showControlBar() {
        return $scope.rights.canRemoveUsers() || $scope.rights.canCreateUsers() ||
          $scope.rights.canEditUsers();
      };

      $scope.currentUserRole = rights.session.projectSettings<LexiconProjectSettings>().currentUserRole;
      $scope.interfaceConfig = rights.session.projectSettings<LexiconProjectSettings>().interfaceConfig;
      pristineLanguageCode = angular.copy($scope.interfaceConfig.userLanguageCode);
      changeInterfaceLanguage($scope.interfaceConfig.userLanguageCode);

      $scope.showSync = function showSync() {
        return !$scope.project.isArchived && rights.canEditUsers() &&
          rights.session.projectSettings<LexiconProjectSettings>().hasSendReceive;
      };

      $scope.gotoDictionary = function gotoDictionary() {
        $location.path('/editor/list');
      };

      $scope.showDictionaryButton = function showDictionaryButton() {
        return !($location.path().indexOf('/editor') === 0);
      };

      $scope.onUpdate = function onUpdate(
        $event: {
          project?: LexiconProject,
          config?: LexiconConfig,
          optionLists?: LexOptionList[]
        }
      ): void {
        if ($event.project) {
          $scope.project = $event.project;
        }

        if ($event.config) {
          $scope.config = $event.config;
        }

        if ($event.optionLists) {
          $scope.optionLists = $event.optionLists;
        }

        if ($event.config || $event.optionLists) {
          configService.getEditorConfig($scope.config, $scope.optionLists).then(configEditor => {
            $scope.editorConfig = configEditor;
          });
        }
      };

      function changeInterfaceLanguage(code: string): void {
        pristineLanguageCode = angular.copy(code);
        if (InputSystemsService.isRightToLeft(code)) {
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

      $scope.$watch('interfaceConfig.userLanguageCode', (newVal: string) => {
        if (newVal && newVal !== pristineLanguageCode) {
          const user = { interfaceLanguageCode: '' };
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
      function setTitle(text: string, fontSize: string, backgroundColor: string): void {
        const title = document.querySelector('nav .mobile-title a') as HTMLElement;
        title.textContent = text;
        title.style.fontSize = fontSize;

        document.querySelector('nav a.navbar-brand').textContent = text;
        (document.querySelector('nav.navbar') as HTMLElement).style.backgroundColor = backgroundColor;
      }

      let offlineMessageId: string;
      Offline.on('up', () => {
        setTitle('Language Forge', '', '');

        if ($scope.online === false) {
          notice.removeById(offlineMessageId);
          notice.push(notice.SUCCESS, 'You are back online!');
        }

        $scope.online = true;
        $scope.$digest();
      });

      Offline.on('down', () => {
        setTitle('Language Forge Offline', '0.8em', '#555');
        offlineMessageId = notice.push(notice.ERROR, 'You are offline. Some features are not available', null, true,
          5 * 1000);
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
    ($scope, $rootScope, breadcrumbService) => {
    $scope.idmap = breadcrumbService.idmap;
    $rootScope.$on('$routeChangeSuccess', () => {
      $scope.breadcrumbs = breadcrumbService.read();
    });

    $scope.$watch('idmap', () => {
      $scope.breadcrumbs = breadcrumbService.read();
    }, true);
  }])
  .name;
