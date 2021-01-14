import * as angular from 'angular';

import { ProjectService } from '../../bellows/core/api/project.service';
import { UserService } from '../../bellows/core/api/user.service';
import { RolesService } from '../../bellows/core/api/roles.service';
import { NoticeService } from '../../bellows/core/notice/notice.service';
import { SessionService } from '../../bellows/core/session.service';
import { Project, ProjectRole, ProjectRoles } from '../../bellows/shared/model/project.model';
import { LdapiProjectDto } from './ldproject-app.component';
import { LdapiUserInfo } from '../../bellows/apps/siteadmin/ldapi-users-view';
import { JsonRpcResult } from '../../bellows/core/api/api.service';

export class LdProjectMembersController implements angular.IController {
  boundSearchUsers: (searchText: string) => void;
  list: any;
  project: LdapiProjectDto;
  isAdmin: boolean;
  projectMembers: [LdapiUserInfo, ProjectRole][];
  // TODO: Three role arrays? That seems redundant. Whittle that down to one. See commented-out getRoles() function
  ldapiRoles: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.NONE];
  roles: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.NONE];
  rolesWithTechSupport: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.TECH_SUPPORT, ProjectRoles.NONE];

  userFilter = '';
  selected: LdapiUserInfo[] = [];

  userSearchResults: LdapiUserInfo[] = [];
  usersPendingAdd: LdapiUserInfo[] = [];
  defaultAddRole: ProjectRole = ProjectRoles.CONTRIBUTOR;
  typeahead = {
    userName: '',
    fullName: ''
  };
  warningText = '';

  private user: LdapiUserInfo;

  static $inject = [
    '$window',
    '$q',
    'userService',
    'projectService',
    'rolesService',
    'silNoticeService'
  ];
  constructor(private $window: angular.IWindowService,
              private $q: angular.IQService,
              private userService: UserService,
              private projectService: ProjectService,
              private rolesService: RolesService,
              private notice: NoticeService) {
                this.boundSearchUsers = this.searchUsers.bind(this);
              }

  $onInit(): void { }

  $onChanges(changes: angular.IOnChangesObject): void {
    const rolesChangeObj = changes.roles as angular.IChangesObject<any>;
    if (rolesChangeObj != null && rolesChangeObj.currentValue) {
      const roles = rolesChangeObj.currentValue;
      // this.rolesAsOwner = [{roleKey: 'project_manager', roleName: 'Manager and Project Owner'}];
      // this.rolesWithoutTechSupport = roles.filter((elem: any) => elem.roleKey !== 'tech_support');
    }
    const projectChange = changes.project as angular.IChangesObject<LdapiProjectDto>;
    if (projectChange != null && projectChange.currentValue) {
      if (this.project.membership) {
        this.updateRoles();
      }
    }
  }

  /* ----------------------------------------------------------
   * List
   * ---------------------------------------------------------- */
  updateSelection(event: Event, user: LdapiUserInfo): void {
    const selectedIndex = this.selected.indexOf(user);
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked && selectedIndex === -1) {
      this.selected.push(user);
    } else if (!checkbox.checked && selectedIndex !== -1) {
      this.selected.splice(selectedIndex, 1);
    }
  }

  isSelected(user: LdapiUserInfo): boolean {
    return user !== null && this.selected.indexOf(user) >= 0;
  }

  fullname(user: LdapiUserInfo) {
    if (user.lastName) {
      return user.firstName ? user.firstName + ' ' + user.lastName : user.lastName;
    } else {
      return user.firstName;
    }
  }

  updateRoles(): void {
    this.projectMembers = [];
    angular.forEach(this.project.membership, (userAndLdRole) => {
      const user = userAndLdRole[0];
      const ldRole = userAndLdRole[1];
      this.rolesService.ldRoleToLfRole(ldRole).then(lfRole => {
        this.projectMembers.push([user, lfRole]);
      });
    });
  }

  queryUserList(): void {
    this.projectService.getLdapiProjectDto(this.project.code, result => {
      if (result.ok) {
        this.project = result.data;
        this.updateRoles();
      }
    });
  };

  // getRoles(user: User) {
  //   if (user.id === this.project.ownerRef.id) {
  //     return this.rolesAsOwner;
  //   }

  //   if (user.role !== 'tech_support') {
  //     return this.rolesWithoutTechSupport;
  //   }

  //   return this.roles;
  // }

  removeProjectUsers(): void {
    const usersToRemove: LdapiUserInfo[] = [];
    const l = this.selected.length;
    // TODO: Remove for loop below since we check for project manager removal elsewhere now
    for (let i = 0; i < l; i++) {

      // Guard against project owner being removed
      // if (this.selected[i].id !== this.project.ownerRef.id) {
        usersToRemove.push(this.selected[i]);
      // } else {
      //   this.notice.push(this.notice.WARN, 'Project owner cannot be removed');
      // }
    }

    if (l === 0) {
      return;
    }

    var promises = this.selected.map(user => {
      // TODO: "user" here is user-and-role, so we need to disentangle them
      return this.projectService.removeUserFromLdapiProject(this.project.code, user.username, updateResult => {
        if (updateResult.ok) {
          this.notice.push(this.notice.SUCCESS, '"' + this.fullname(user) + '" was removed from ' +
            this.project.name + ' successfully');
          // TODO: Make this a notice, not a console log
          // console.log('"' + this.fullname(user) + '" was removed from ' + this.project.name + ' successfully');
        }
      });
    }, this);
    this.$q.all(promises).then(result => {
      // Possibly pop up a notice saying "N users were removed from project X: (list of names)" or just "(name) was removed from project X"
      this.selected.splice(0);
      this.queryUserList();
    });

    // TODO: redirect to /app/projects if you just removed yourself from this project, e.g. this.$window.location.href = '/app/projects';
  }

  // TODO: rewrite as arrow function so boundSearchUsers won't be needed
  searchUsers(searchText: string): void {
    this.userService.searchLdapiUsers(searchText).then(result => {
      if (result.ok) {
        this.userSearchResults = result.data;
      } else {
        this.userSearchResults = [];
      }
    }).catch(err => {
      this.userSearchResults = [];
    });
  }

  userIsManager(username: string) {
    return this.userService.ldapiUserIsManagerOfProject(username, this.project.code).then(result => {
      if (result.ok) {
        return result.data;
      } else {
        return false;
      }
    });
  }

  userIsLastManager(username: string) {
    // Note that at this point, projectMembers has already recorded the change from Manager to something else, so we can't
    // just look up whether the username is in projectMembers as a manager
    return this.userIsManager(username).then(isManager => {
      if (isManager) {
        const otherManagers = this.projectMembers.filter(([user, role]) => user.username !== username && role.key === ProjectRoles.MANAGER.key);
        // NOTE: Tech Support roles are NOT counted here. We want at least one real manager role.
        return (otherManagers.length === 0);
      } else {
        return false;
      }
    });
  }

  // noinspection JSUnusedGlobalSymbols
  onRoleChange(userAndRole: [LdapiUserInfo, ProjectRole]): angular.IPromise<JsonRpcResult> {
    // TODO: warning if you're about to remove yourself as a manager, saying "You won't be able to make further edits to this project if you proceed"
    // TODO: redirect to /app/projects if you just removed yourself from this project as a manager and confirmed that
    const [user, newRole] = userAndRole;
    return this.rolesService.lfRoleToLdRole(newRole.key).then(ldRole => {
      return this.userIsLastManager(user.username).then(isLast => {
        if (isLast) {
          console.log(`User ${user.username} is the last manager; warn the user about it`)
          // TODO: actually notify the warning message
          userAndRole[1] = ProjectRoles.MANAGER;
        } else {
          return this.projectService.updateLdapiUserRole(this.project.code, user.username, ldRole, result => {
            if (result.ok) {
              const name = this.fullname(user);
              const message = `${name}'s role was changed to ${newRole.name}.`;
              this.notice.push(this.notice.SUCCESS, message);
              console.log(message);
            }
          });
        }
      });
    });
  }

  // arrow function used here to bind to the class instance. IJH 2017-09
  selectUser = (user: LdapiUserInfo): void => {
    if (user && this.usersPendingAdd.indexOf(user) < 0) {
      this.usersPendingAdd.push(user);
    }
  }

  addProjectUsers(): void {
    this.typeahead.userName = '';
    this.typeahead.fullName = '';
    var promises = this.usersPendingAdd.map(user => {
      // TODO: Make this a notice, not a console log
      // console.log("Adding user", this.project.code, user, this.rolesService.contributor);
      return this.rolesService.lfRoleToLdRole(this.defaultAddRole.key).then(ldRole => {
        return this.projectService.updateLdapiUserRole(this.project.code, user.username, ldRole, updateResult => {
          if (updateResult.ok) {
            this.notice.push(this.notice.SUCCESS, '"' + this.fullname(user) + '" was added to ' +
              this.project.name + ' as ' + this.defaultAddRole.name);
            // TODO: Make this a notice, not a console log
            // console.log('"' + this.fullname(user) + '" was added to ' + this.project.name + ' as ' + this.defaultAddRole.name);
          }
        });
      });
    }, this);
    this.$q.all(promises).then(result => {
      this.usersPendingAdd.splice(0);
      this.queryUserList();
    });
  }

}

export const LdProjectMembersComponent: angular.IComponentOptions = {
  bindings: {
    project: '<',
    isAdmin: '<',
  },
  controller: LdProjectMembersController,
  templateUrl: '/angular-app/languageforge/ldproject/ldproject-members.component.html'
};
