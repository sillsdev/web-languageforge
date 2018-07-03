import * as angular from 'angular';

import {InterfaceConfig} from '../shared/model/interface-config.model';
import {ProjectSettings} from '../shared/model/project-settings.model';
import {ProjectService, ProjectTypeNames} from './api/project.service';
import {ApplicationHeaderService, HeaderData} from './application-header.service';
import {SessionService} from './session.service';

interface Rights {
  canCreateProject: boolean;
}

export class NavbarController implements angular.IController {
  rights: Rights = {} as Rights;
  projectTypesBySite: () => string[];
  header: HeaderData;
  interfaceConfig: InterfaceConfig;
  projectTypeNames: ProjectTypeNames;
  siteName: string;

  static $inject = ['projectService', 'sessionService',
    'applicationHeaderService'];
  constructor(private readonly projectService: ProjectService, private readonly sessionService: SessionService,
              private readonly applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
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
      } else {
        this.interfaceConfig = projectSettings.interfaceConfig;
      }
      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.siteName = session.baseSite();
    });
  }

  onUpdate = ($event: { interfaceConfig: InterfaceConfig}) => {
    if ($event.interfaceConfig) {
      this.interfaceConfig = $event.interfaceConfig;
    }
  }

}
