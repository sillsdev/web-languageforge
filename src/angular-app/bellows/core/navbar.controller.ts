import * as angular from 'angular';

import {LexiconProjectSettings} from '../../languageforge/lexicon/shared/model/lexicon-project-settings.model';
import {InterfaceConfig} from '../shared/model/interface-config.model';
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

  static $inject = ['projectService', 'sessionService', 'applicationHeaderService'];
  constructor(private projectService: ProjectService, private sessionService: SessionService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.projectTypeNames = this.projectService.data.projectTypeNames;
    this.projectTypesBySite = this.projectService.data.projectTypesBySite;
    this.header = this.applicationHeaderService.data;
    this.sessionService.getSession().then(session => {
      this.interfaceConfig = session.projectSettings<LexiconProjectSettings>().interfaceConfig ||
        {
          languageCode: 'en',
          isUserLanguageCode: true,
          selectLanguages: {
            optionsOrder: ['en'],
            options: { en: 'English' }
          }
        } as InterfaceConfig;
      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.siteName = session.baseSite();
    });
  }

}
