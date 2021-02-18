import * as angular from 'angular';

import { ProjectService } from '../../bellows/core/api/project.service';
import { Session, SessionService } from '../../bellows/core/session.service';
import { LdapiProjectDto, LdapiUserInfo } from '../../bellows/shared/model/ldapi.model';

export class LdProjectAppController implements angular.IController {
  project: LdapiProjectDto = undefined;
  session: angular.IPromise<Session>;
  isAdmin: boolean = false;
  projectId: string = "";

  static $inject = [
    '$location',
    'projectService',
    'sessionService',
  ];
  constructor(
    private readonly $location: angular.ILocationService,
    private readonly projectService: ProjectService,
    private readonly sessionService: SessionService,
  ) { }

  $onInit(): void {
    this.session = this.sessionService.getSession();
    this.session.then(session => {
      if (session.hasSiteRight(this.sessionService.domain.USERS, this.sessionService.operation.EDIT)) {
        this.isAdmin = true;
      };
    });
    // TODO find a better way to extract this; is there a path-component splitter available?
    var match = this.$location.path().match(/\/app\/ldproject\/([^\/]+)/);
    if (match.length > 1) {
      this.projectId = match[1];
      this.projectService.getLdapiProjectDto(this.projectId).then(result => {
        if (result.ok) {
          this.project = result.data;
        }
      });
    }
  }
}

export const LdProjectAppComponent: angular.IComponentOptions = {
  controller: LdProjectAppController,
  templateUrl: '/angular-app/languageforge/ldproject/ldproject-app.component.html'
};
