import * as angular from 'angular';

import {InputSystemsService} from '../../bellows/core/input-systems/input-systems.service';
import {NoticeService} from '../../bellows/core/notice/notice.service';
import {InterfaceConfig} from '../../bellows/shared/model/interface-config.model';
import {User} from '../../bellows/shared/model/user.model';
import {LexiconConfigService} from './core/lexicon-config.service';
import {LexiconEditorDataService} from './core/lexicon-editor-data.service';
import {LexiconProjectService} from './core/lexicon-project.service';
import {LexiconRightsService, Rights} from './core/lexicon-rights.service';
import {LexiconSendReceiveService} from './core/lexicon-send-receive.service';
import {LexiconConfig} from './shared/model/lexicon-config.model';
import {LexiconProjectSettings} from './shared/model/lexicon-project-settings.model';
import {LexiconProject} from './shared/model/lexicon-project.model';
import {LexOptionList} from './shared/model/option-list.model';

export class LexiconAppController implements angular.IController {
  finishedLoading: boolean = false;
  config: LexiconConfig;
  editorConfig: LexiconConfig;
  interfaceConfig: InterfaceConfig;
  optionLists: LexOptionList[];
  project: LexiconProject;
  rights: Rights;
  users: { [userId: string]: User };

  private online: boolean;
  private pristineLanguageCode: string;

  static $inject = ['$scope', '$location',
    '$q', 'silNoticeService',
    'lexConfigService',
    'lexProjectService',
    'lexEditorDataService',
    'lexRightsService',
    'lexSendReceive'
  ];
  constructor(private readonly $scope: angular.IScope, private readonly $location: angular.ILocationService,
              private readonly $q: angular.IQService, private readonly notice: NoticeService,
              private readonly configService: LexiconConfigService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly editorService: LexiconEditorDataService,
              private readonly rightsService: LexiconRightsService,
              private readonly sendReceive: LexiconSendReceiveService) { }

  $onInit(): void {
    this.editorService.loadEditorData().then(() => {
      this.finishedLoading = true;
      this.sendReceive.checkInitialState();
    });

    this.$q.all([this.rightsService.getRights(), this.configService.getEditorConfig()])
      .then(([rights, editorConfig]) => {
        if (rights.canEditProject()) {
          this.lexProjectService.users().then(result => {
            if (result.ok) {
              const users = {};
              for (const user of (result.data.users as User[])) {
                users[user.id] = user;
              }

              this.users = users;
            }
          });
        }

        this.editorConfig = editorConfig;
        this.project = rights.session.project();
        this.config = rights.session.projectSettings<LexiconProjectSettings>().config;
        this.optionLists = rights.session.projectSettings<LexiconProjectSettings>().optionlists;
        this.interfaceConfig = rights.session.projectSettings<LexiconProjectSettings>().interfaceConfig;
        this.rights = rights;
        this.pristineLanguageCode = angular.copy(this.interfaceConfig.userLanguageCode);
        this.changeInterfaceLanguage(this.interfaceConfig.userLanguageCode);

        this.$scope.$watch(() => this.interfaceConfig.userLanguageCode, (newVal: string) => {
          if (newVal && newVal !== this.pristineLanguageCode) {
            const user = { interfaceLanguageCode: '' };
            user.interfaceLanguageCode = newVal;
            this.lexProjectService.updateUserProfile(user);
            this.changeInterfaceLanguage(newVal);
          }
        });
      }
    );

    this.setupOffline();
  }

  $onDestroy(): void {
    this.sendReceive.cancelAllStatusTimers();
  }

  onUpdate = (
    $event: {
      project?: LexiconProject,
      config?: LexiconConfig,
      optionLists?: LexOptionList[]
    }
  ): void => {
    if ($event.project) {
      this.project = $event.project;
    }

    if ($event.config) {
      this.config = $event.config;
    }

    if ($event.optionLists) {
      this.optionLists = $event.optionLists;
    }

    if ($event.config || $event.optionLists) {
      this.configService.getEditorConfig(this.config, this.optionLists).then(configEditor => {
        this.editorConfig = configEditor;
      });
    }
  }

  private changeInterfaceLanguage(code: string): void {
    this.pristineLanguageCode = angular.copy(code);
    if (InputSystemsService.isRightToLeft(code)) {
      this.interfaceConfig.direction = 'rtl';
      this.interfaceConfig.pullToSide = 'float-left';
      this.interfaceConfig.pullNormal = 'float-right';
      this.interfaceConfig.placementToSide = 'right';
      this.interfaceConfig.placementNormal = 'left';
    } else {
      this.interfaceConfig.direction = 'ltr';
      this.interfaceConfig.pullToSide = 'float-right';
      this.interfaceConfig.pullNormal = 'float-left';
      this.interfaceConfig.placementToSide = 'left';
      this.interfaceConfig.placementNormal = 'right';
    }
  }

  private setupOffline(): void {
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

      if (this.online === false) {
        this.notice.removeById(offlineMessageId);
        this.notice.push(this.notice.SUCCESS, 'You are back online!');
      }

      this.online = true;
      this.$scope.$digest();
    });

    Offline.on('down', () => {
      setTitle('Language Forge Offline', '0.8em', '#555');
      offlineMessageId = this.notice.push(this.notice.ERROR, 'You are offline. Some features are not available', null,
        true, 5 * 1000);
      this.online = false;
      if (!/^\/editor\//.test(this.$location.path())) {
        // redirect to the editor
        this.$location.path('/editor');
        this.notice.push(this.notice.SUCCESS, 'The dictionary editor is available offline.  Settings are not.');
      }

      this.$scope.$digest();
    });
  }

}

export const LexiconAppComponent: angular.IComponentOptions = {
  controller: LexiconAppController,
  templateUrl: '/angular-app/languageforge/lexicon/lexicon-app.component.html'
};
