import * as angular from 'angular';

import {HelpHeroService} from '../../bellows/core/helphero.service';
import {ModalService} from '../../bellows/core/modal/modal.service';
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

  private online: boolean;
  private pristineLanguageCode: string;

  static $inject = ['$scope', '$location',
    '$q',
    '$uibModal',
    'silNoticeService', 'lexConfigService',
    'lexProjectService',
    'lexEditorDataService',
    'lexRightsService',
    'lexSendReceive',
    'helpHeroService'];
  constructor(private readonly $scope: angular.IScope, private readonly $location: angular.ILocationService,
              private readonly $q: angular.IQService,
              private readonly $modal: ModalService,
              private readonly notice: NoticeService, private readonly configService: LexiconConfigService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly editorService: LexiconEditorDataService,
              private readonly rightsService: LexiconRightsService,
              private readonly sendReceive: LexiconSendReceiveService,
              private readonly helpHeroService: HelpHeroService) { }

  $onInit(): void {
    let finishedPreloading = false;

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

        if (this.rights) {
          this.helpHeroService.setIdentity(this.rights.session.userId());
        } else {
          this.helpHeroService.anonymous();
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

  openShareWithOthersModal(): void {
    const modalInstance = this.$modal.open({
      templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others.modal.html',
      controller: ['$scope', '$uibModalInstance',
        ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = () => {
            $modalInstance.close($scope.selected);
          };

          $scope.close = $modalInstance.dismiss;
        }
      ],
      windowTopClass: 'modal-select-language'
    });
    // modalInstance.result.then(selected => {
    //   this.npsNewProject.languageCode = selected.code;
    //   this.npsNewProject.language = selected.language;
    // }, () => {});
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
      this.sendReceive.checkInitialState();
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
    // setup offline.js options
    // see https://github.com/hubspot/offline for all options
    // we tell offline.js to NOT store and remake requests while the connection is down
    Offline.options.requests = false;
    Offline.options.checkOnLoad = true;
    Offline.options.checks = { xhr: { url: '/offlineCheck.txt' } };

    // Set the page's Language Forge title, font size, and nav's background color
    function setTitle(text: string, backgroundColorA: string, backgroundColorB: string): void {
      (document.querySelector('nav .navbar-brand .website-title') as HTMLElement).textContent = text;
      (document.querySelectorAll('nav.navbar')[0] as HTMLElement).style.backgroundColor = backgroundColorA;
      (document.querySelectorAll('nav.navbar-expand')[1] as HTMLElement).style.backgroundColor = backgroundColorB;
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
      setTitle('Language Forge Offline', '#555', '#777');
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
