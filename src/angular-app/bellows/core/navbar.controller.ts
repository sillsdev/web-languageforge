import * as angular from 'angular';

import {InterfaceConfig} from '../shared/model/interface-config.model';
import {ProjectSettings} from '../shared/model/project-settings.model';
import {Project, ProjectRoles} from '../shared/model/project.model';
import {ApplicationHeaderService, HeaderData} from './application-header.service';
import {ModalService} from './modal/modal.service';
import {OfflineCacheUtilsService} from './offline/offline-cache-utils.service';
import {Session, SessionService} from './session.service';

interface Rights {
  canCreateProject: boolean;
}

export class NavbarController implements angular.IController {
  rights: Rights = {} as Rights;
  header: HeaderData;
  session: Session;
  project: Project;
  interfaceConfig: InterfaceConfig;
  currentUserIsProjectManager: boolean;
  displayShareButton: boolean;
  siteName: string;
  isLexiconProject: boolean = false;

  static $inject = [
    '$scope',
    '$uibModal',
    'sessionService',
    'offlineCacheUtils',
    'applicationHeaderService'];
  constructor(private readonly $scope: angular.IScope,
              private readonly $modal: ModalService,
              private readonly sessionService: SessionService,
              private readonly offlineCacheUtils: OfflineCacheUtilsService,
              private readonly applicationHeaderService: ApplicationHeaderService,
              ) { }

  $onInit(): void {
    this.header = this.applicationHeaderService.data;
    this.sessionService.getSession().then(session => {
      this.session = session;
      this.project = this.session.data.project;
      const defaultInterfaceConfig =
        {
          direction: 'ltr',
          pullNormal: 'float-left',
          pullToSide: 'float-right',
          placementNormal: 'right',
          placementToSide: 'left',
          languageCode: 'en',
          isUserLanguageCode: true,
          audioRecordingCodec: 'webm',
          whenToConvertAudio: 'never',
          selectLanguages: {
            optionsOrder: ['en'],
            options: { en: { name: 'English', option: 'English' } }
          },
          selectAudioRecordingCodec: {
            optionsOrder: ['webm'],
            options: { webm: { codec: 'OPUS/WEBM'}},
          },
          selectWhenToConvertAudio: {
            optionsOrder: ['never', 'SR', 'always'],
            options: { never: { frequency: 'Never'} },
          }
        } as InterfaceConfig;
      const projectSettings = session.projectSettings<ProjectSettings>();
      if (projectSettings == null || projectSettings.interfaceConfig == null) {
        this.interfaceConfig = defaultInterfaceConfig;
        this.useLocallyStoredLanguageCode();
      } else {
        this.interfaceConfig = projectSettings.interfaceConfig;
        if (this.isNotInProject()) {
          this.useLocallyStoredLanguageCode();
        }
      }
      if (this.project) {
        this.currentUserIsProjectManager =
          (session.data.userProjectRole === ProjectRoles.MANAGER.key) ||
          (session.data.userProjectRole === ProjectRoles.TECH_SUPPORT.key);
        this.displayShareButton =
          (this.currentUserIsProjectManager || (this.project.allowSharing && this.session.data.userIsProjectMember));
      }

      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.siteName = session.baseSite();
    });
    this.$scope.$on('$locationChangeStart', (event, next, current) => {
      if (current.includes('/lexicon') && !current.includes('/new-project')) {
        this.isLexiconProject = true;
      } else {
        this.isLexiconProject = false;
      }
    });
  }

  onUpdate = ($event: { interfaceConfig: InterfaceConfig}): void => {
    if ($event.interfaceConfig) {
      this.interfaceConfig = $event.interfaceConfig;
    }
  }

  openShareWithOthersModal(): void {
    const modalInstance = this.$modal.open({
      component: 'shareWithOthersModal'
    });
    modalInstance.result.then(data => {
      // TODO: save the data if not already
    }, () => {});
  }

  private isNotInProject(): boolean {
    // ToDo: slightly tenuous way to check if we are not in a project - will do for now - IJH 2018-07
    return this.interfaceConfig.selectLanguages.optionsOrder.length <= 1;
  }

  private useLocallyStoredLanguageCode(): void {
    this.offlineCacheUtils.getInterfaceLanguageCode().then(localLanguageCode => {
      if (localLanguageCode != null) {
        this.interfaceConfig.languageCode = localLanguageCode;
      }
    }).catch(() => {});
  }

}
