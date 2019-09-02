import * as angular from 'angular';

import { LexiconProjectService } from '../../../languageforge/lexicon/core/lexicon-project.service';
import { ProjectService } from '../../core/api/project.service';
import { ApplicationHeaderService } from '../../core/application-header.service';
import { BreadcrumbService } from '../../core/breadcrumbs/breadcrumb.service';
import { BrowserCheckService } from '../../core/browser-check.service';
import { HelpHeroService } from '../../core/helphero.service';
import { SessionService } from '../../core/session.service';

export class Rights {
  remove: boolean;
  add: boolean;
  changeRole: boolean;
  showControlBar: boolean;
}

export interface Role {
  roleKey: string;
  roleName: string;
}

export class UserManagementAppController implements angular.IController {
  rights = new Rights();
  roles: Role[] = [];
  project = {
    roles: [] as Role[],
    projectName: '',
    appLink: ''
  };
  list = {
    visibleUsers: {},
    users: {},
    allUsers: {},
    userCount: 0
  };
  joinRequests = {};

  currentUser = {
    id: ''
  };

  static $inject = ['$location', 'projectService', 'sessionService', 'applicationHeaderService',
                    'browserCheckService', 'breadcrumbService', 'lexProjectService', 'helpHeroService'];
  constructor(private $location: angular.ILocationService, private projectService: ProjectService,
              private sessionService: SessionService, private applicationHeaderService: ApplicationHeaderService,
              private browserCheckService: BrowserCheckService,
              private breadcrumbService: BreadcrumbService, private lexProjectService: LexiconProjectService,
              private readonly helpHeroService: HelpHeroService) { }

  $onInit(): void {
    this.joinRequests = [];
    this.projectService.getJoinRequests(result => {
      this.joinRequests = result.data;
    });

    // load roles if they have not been loaded yet
    if (this.roles.length === 0) {
      this.queryUserList();
    }

    this.browserCheckService.warnIfIE();

    this.sessionService.getSession().then(session => {
      this.rights.remove = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.DELETE);
      this.rights.add = session.hasProjectRight(this.sessionService.domain.USERS, this.sessionService.operation.CREATE);
      this.rights.changeRole = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.EDIT);
      this.rights.showControlBar =
        this.rights.add || this.rights.remove || this.rights.changeRole;

      this.currentUser.id = session.userId();
      if (this.currentUser.id) {
        this.helpHeroService.setIdentity(this.currentUser.id);
      } else {
        this.helpHeroService.anonymous();
      }
    });
  }

  // noinspection JSUnusedGlobalSymbols
  isActive(route: string) {
    return route === this.$location.path();
  }

  queryUserList() {
    this.projectService.listUsers( result => {
      if (result.ok) {
        this.list.users = result.data.users;
        this.list.userCount = result.data.userCount;
        this.list.allUsers = result.data.users.concat(result.data.invitees.map((invitee: any) => {
          invitee.isInvitee = true;
          return invitee;
        }));
        this.project = result.data.project;
        this.roles = this.project.roles;
        this.applicationHeaderService.setPageName(this.project.projectName + ' User Management');
        this.lexProjectService.setBreadcrumbs('', 'User Management');
        this.lexProjectService.setupSettings();
      }
    });
  }

}

export const UserManagementAppComponent: angular.IComponentOptions = {
  controller: UserManagementAppController,
  templateUrl: '/angular-app/bellows/apps/usermanagement/user-management-app.component.html'
};
