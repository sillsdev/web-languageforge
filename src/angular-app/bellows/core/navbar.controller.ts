import * as angular from 'angular';

import {InterfaceConfig} from '../shared/model/interface-config.model';
import {ProjectSettings} from '../shared/model/project-settings.model';
import {ProjectService, ProjectTypeNames} from './api/project.service';
import {ApplicationHeaderService, HeaderData} from './application-header.service';
import { ModalService } from './modal/modal.service';
import {OfflineCacheUtilsService} from './offline/offline-cache-utils.service';
import {Session, SessionService} from './session.service';

interface Rights {
  canCreateProject: boolean;
}

export class NavbarController implements angular.IController {
  rights: Rights = {} as Rights;
  projectTypesBySite: () => string[];
  header: HeaderData;
  interfaceConfig: InterfaceConfig;
  currentUserIsProjectOwner: boolean;
  projectTypeNames: ProjectTypeNames;
  siteName: string;

  static $inject = ['$uibModal',
    'projectService', 'sessionService',
    'offlineCacheUtils',
    'applicationHeaderService'];
  constructor(private readonly $modal: ModalService,
              private readonly projectService: ProjectService, private readonly sessionService: SessionService,
              private readonly offlineCacheUtils: OfflineCacheUtilsService,
              private readonly applicationHeaderService: ApplicationHeaderService) { }

  $onInit(): void {
    this.projectTypeNames = this.projectService.data.projectTypeNames;
    this.projectTypesBySite = this.projectService.data.projectTypesBySite;
    this.header = this.applicationHeaderService.data;
    this.sessionService.getSession().then(session => {
      const defaultInterfaceConfig =
        {
          direction: 'ltr',
          pullNormal: 'float-left',
          pullToSide: 'float-right',
          placementNormal: 'right',
          placementToSide: 'left',
          languageCode: 'en',
          isUserLanguageCode: true,
          selectLanguages: {
            optionsOrder: ['en'],
            options: { en: { name: 'English', option: 'English' } }
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
      this.currentUserIsProjectOwner = session.data.userId === session.data.project.ownerRef.id;
      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.siteName = session.baseSite();
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
