import * as angular from 'angular';

import {ProjectService} from './api/project.service';
import {ApplicationHeaderService, HeaderData} from './application-header.service';
import {SessionService} from './session.service';

class Rights {
  canCreateProject: boolean;
}

export class NavbarController implements angular.IController {
  rights: Rights = new Rights();
  projectTypeNames: any;
  projectTypesBySite: () => string[];
  siteName: string;
  header: HeaderData;

  static $inject = ['projectService', 'sessionService', 'applicationHeaderService'];
  constructor(private projectService: ProjectService, private sessionService: SessionService,
              private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.projectTypeNames = this.projectService.data.projectTypeNames;
    this.projectTypesBySite = this.projectService.data.projectTypesBySite;
    this.header = this.applicationHeaderService.data;
    this.sessionService.getSession().then(session => {
      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.siteName = session.baseSite();
    });
  }

}
