import * as angular from 'angular';

import { LexiconProjectService } from '../../../languageforge/lexicon/core/lexicon-project.service';
import { ProjectService } from '../../core/api/project.service';
import { ApplicationHeaderService } from '../../core/application-header.service';
import { BreadcrumbService } from '../../core/breadcrumbs/breadcrumb.service';
import { SessionService } from '../../core/session.service';
import { HelpHeroService } from '../../core/helphero.service';
import { User } from '../../shared/model/user.model';

export class Rights {
  remove: boolean;
  add: boolean;
  changeRole: boolean;
  showControlBar: boolean;
}

export class UserManagementAppController implements angular.IController {
  rights = new Rights();
  roles = {};
  project = {
    roles: {},
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
                    'breadcrumbService', 'lexProjectService', 'helpHeroService', '$q'];
  constructor(private $location: angular.ILocationService, private projectService: ProjectService,
              private sessionService: SessionService, private applicationHeaderService: ApplicationHeaderService,
              private breadcrumbService: BreadcrumbService, private lexProjectService: LexiconProjectService,
              private readonly helpHeroService: HelpHeroService, private readonly $q: angular.IQService) { }

  $onInit(): void {
    this.joinRequests = [];
    this.projectService.getJoinRequests(result => {
      this.joinRequests = result.data;
    });

    // load roles if they have not been loaded yet
    if (Object.keys(this.roles).length === 0) {
      this.queryUserList();
    }

    this.sessionService.getSession().then(session => {
      this.rights.remove = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.DELETE);
      this.rights.add = session.hasProjectRight(this.sessionService.domain.USERS, this.sessionService.operation.CREATE);
      this.rights.changeRole = session.hasProjectRight(this.sessionService.domain.USERS,
        this.sessionService.operation.EDIT);
      this.rights.showControlBar =
        this.rights.add || this.rights.remove || this.rights.changeRole;

      const userId = session.userId();
      if (userId) {
        this.helpHeroService.setIdentity(userId);
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
    this.$q.all([this.projectService.listUsers(), this.sessionService.getSession()]).then(([users, session]) => {
      if (users.ok) {
        this.list.users = users.data.users;
        this.list.userCount = users.data.userCount;
        this.list.allUsers = users.data.users.concat(users.data.invitees.map((invitee: any) => {
          invitee.isInvitee = true;
          return invitee;
        }));
        this.project = users.data.project;
        this.roles = this.project.roles;
        this.applicationHeaderService.setPageName(this.project.projectName + ' User Management');
        this.lexProjectService.setBreadcrumbs('', 'User Management');
        this.lexProjectService.setupSettings();
        this.currentUser.id = session.userId();
      }
    });
  }

}

export const UserManagementAppComponent: angular.IComponentOptions = {
  controller: UserManagementAppController,
  templateUrl: '/angular-app/bellows/apps/usermanagement/user-management-app.component.html'
};
