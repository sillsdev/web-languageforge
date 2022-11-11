import * as angular from 'angular';

import {SiteWideNoticeService} from '../../bellows/core/site-wide-notice-service';
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
  interfaceConfig: InterfaceConfig = {} as InterfaceConfig;
  users: { [userId: string]: User } = {};
  config: LexiconConfig;
  editorConfig: LexiconConfig;
  optionLists: LexOptionList[];
  project: LexiconProject;
  rights: Rights;

  private pristineLanguageCode: string;

  static $inject = ['$scope', '$location',
    '$q',
    'silNoticeService', 'lexConfigService',
    'siteWideNoticeService',
    'lexProjectService',
    'lexEditorDataService',
    'lexRightsService',
    'lexSendReceive',
	'$window',
  ];
  constructor(private readonly $scope: angular.IScope, private readonly $location: angular.ILocationService,
              private readonly $q: angular.IQService,
              private readonly notice: NoticeService, private readonly configService: LexiconConfigService,
              private readonly siteWideNoticeService: SiteWideNoticeService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly editorService: LexiconEditorDataService,
              private readonly rightsService: LexiconRightsService,
              private readonly sendReceive: LexiconSendReceiveService,
			  private $window: angular.IWindowService,
             ) { }

  $onInit(): void {
    let finishedPreloading = false;

    this.siteWideNoticeService.displayNotices();

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
            this.setupConfig(rights, editorConfig);
            finishedPreloading = true;
          }).then(() => { // end of path "B" -- user can edit
            if (finishedPreloading && !this.finishedLoading) this.postLoad();
          });
        } else {
          this.setupConfig(rights, editorConfig);
          finishedPreloading = true;
        }

        this.$scope.$watch(() => this.interfaceConfig.languageCode, (newVal: string) => {
          if (newVal && this.pristineLanguageCode && newVal !== this.pristineLanguageCode) {
            this.updateUserProfile(newVal);
            this.pristineLanguageCode = newVal;
          }
        });
      }
    )
    .then(() => { // end of path "A" -- user cannot edit
      if (finishedPreloading && !this.finishedLoading) this.postLoad();
    });

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
      if (!this.interfaceConfig.isUserLanguageCode) {
        this.interfaceConfig.languageCode = this.project.interfaceLanguageCode;
      } else if (this.interfaceConfig.languageCode === this.project.interfaceLanguageCode) {
        this.updateUserProfile(this.interfaceConfig.languageCode);
      }
    }

    if ($event.config) {
      this.config = $event.config;
      this.sendReceive.setPollUpdateInterval(this.config.pollUpdateIntervalMs);
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

  private setupConfig(rights: Rights, editorConfig: LexiconConfig): void {
    this.editorConfig = editorConfig;
    this.project = rights.session.project<LexiconProject>();
    this.config = rights.session.projectSettings<LexiconProjectSettings>().config;
    this.optionLists = rights.session.projectSettings<LexiconProjectSettings>().optionlists;
    this.interfaceConfig = rights.session.projectSettings<LexiconProjectSettings>().interfaceConfig;
    this.pristineLanguageCode = this.interfaceConfig.languageCode;
    this.rights = rights;
  }

  private postLoad() {
    this.editorService.loadEditorData().then(() => {
      this.finishedLoading = true;
      this.sendReceive.checkInitialState(this.config.pollUpdateIntervalMs);
    });
  }

  private updateUserProfile(languageCode: string): void {
    const user = { interfaceLanguageCode: languageCode };
    if (languageCode === this.project.interfaceLanguageCode) {
      user.interfaceLanguageCode = null;
      this.interfaceConfig.isUserLanguageCode = false;
    } else {
      this.interfaceConfig.isUserLanguageCode = true;
    }
    this.lexProjectService.updateUserProfile(user);
  }

  private setupOffline(): void {
	this.$window.addEventListener('offline', e => setTitle('Language Forge Offline', '#555', '#777'));
	this.$window.addEventListener('online', e => setTitle('Language Forge', '', ''));

    function setTitle(text: string, backgroundColorA: string, backgroundColorB: string): void {
      (document.querySelector('nav .navbar-brand .website-title') as HTMLElement).textContent = text;
      (document.querySelectorAll('nav.navbar')[0] as HTMLElement).style.backgroundColor = backgroundColorA;
      (document.querySelectorAll('nav.navbar-expand')[1] as HTMLElement).style.backgroundColor = backgroundColorB;
    }
  }
}

export const LexiconAppComponent: angular.IComponentOptions = {
  controller: LexiconAppController,
  templateUrl: '/angular-app/languageforge/lexicon/lexicon-app.component.html'
};
