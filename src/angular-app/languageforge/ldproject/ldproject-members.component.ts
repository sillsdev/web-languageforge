import * as angular from 'angular';

import { ProjectService } from '../../bellows/core/api/project.service';
import { UserService } from '../../bellows/core/api/user.service';
import { RolesService } from '../../bellows/core/api/roles.service';
import { NoticeService } from '../../bellows/core/notice/notice.service';
import { SessionService } from '../../bellows/core/session.service';
import { User } from '../../bellows/shared/model/user.model';
import { Project, ProjectRole, ProjectRoles } from '../../bellows/shared/model/project.model';
import { LdapiProjectInfo } from '../../bellows/apps/siteadmin/ldapi-projects-view';
import { LdapiProjectDto } from './ldproject-app.component';
import { LdapiUserInfo } from '../../bellows/apps/siteadmin/ldapi-users-view';
import { JsonRpcResult } from '../../bellows/core/api/api.service';

export class LdProjectMembersController implements angular.IController {
  boundSearchUsers: (searchText: string) => void;
  list: any;
  project: LdapiProjectDto;
  isAdmin: boolean;
  projectMembers: [LdapiUserInfo, ProjectRole][];
  ldapiRoles: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.NONE];
  roles: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.NONE];
  rolesWithTechSupport: ProjectRole[] = [ProjectRoles.MANAGER, ProjectRoles.CONTRIBUTOR, ProjectRoles.TECH_SUPPORT, ProjectRoles.NONE];
  // rights: Rights;

  userFilter = '';
  selected: LdapiUserInfo[] = [];

  userSearchResults: LdapiUserInfo[] = [];
  usersPendingAdd: LdapiUserInfo[] = [];
  defaultAddRole: ProjectRole = ProjectRoles.CONTRIBUTOR;
  addModes = {
    addExisting: { en: 'Add Existing User', icon: 'fa fa-user' },
    invite: { en: 'Send Email Invite', icon: 'fa fa-envelope' }
  };
  addMode = 'addExisting';
  disableAddButton = true;
  typeahead = {
    userName: '',
    fullName: ''
  };
  warningText = '';

  private user: LdapiUserInfo;

  static $inject = ['$window', '$location', '$q', 'userService', 'projectService', 'sessionService', 'rolesService', 'silNoticeService'];
  constructor(private $window: angular.IWindowService,
              private $location: angular.ILocationService,
              private $q: angular.IQService,
              private userService: UserService,
              private projectService: ProjectService,
              private sessionService: SessionService,
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

  // isRoleSelectDisabled(user: User): boolean {
  //   if (user.id === this.project.ownerRef.id ||
  //     (user.role === 'tech_support' && user.id !== this.currentUser.id) ||
  //     /* !this.rights.changeRole */ false) { return true; }

  //   return false;
  // }

  removeProjectUsers(): void {
    const usersToRemove: LdapiUserInfo[] = [];
    const l = this.selected.length;
    for (let i = 0; i < l; i++) {

      // Guard against project owner being removed
      // if (this.selected[i].id !== this.project.ownerRef.id) {
        usersToRemove.push(this.selected[i]);
      // } else {
      //   this.notice.push(this.notice.WARN, 'Project owner cannot be removed');
      // }
    }

    if (l === 0) {

      // TODO ERROR
      return;
    }

    var promises = this.selected.map(user => {
      console.log("Removing user", user, "from", this.project.name);
      // TODO: "user" here is user-and-role, so we need to disentangle them
      return this.projectService.removeUserFromLdapiProject(this.project.code, user.username, updateResult => {
        if (updateResult.ok) {
          this.notice.push(this.notice.SUCCESS, '"' + this.fullname(user) + '" was removed from ' +
            this.project.name + ' successfully');
          console.log('"' + this.fullname(user) + '" was removed from ' + this.project.name + ' successfully');
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

  searchUsers(searchText: string): void {
    this.userService.searchLdapiUsers(searchText).then(result => {
      if (result.ok) {
        this.userSearchResults = result.data;
      } else {
        this.userSearchResults = [];
      }
    }).catch(err => {
      console.log(`Error ${err} while searching for ${searchText}`);
      this.userSearchResults = [];
    });
  }

  userIsManager(username: string) {
    return this.userService.ldapiUserIsManagerOfProject(username, this.project.code).then(result => {
      if (result.ok) {
        console.log('userIsManager returned:', result.data);
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
      console.log('Will change', user, 'role to', newRole, 'which is', ldRole, 'in LD');
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

  /* ----------------------------------------------------------
   * Typeahead
   * ---------------------------------------------------------- */

  // arrow functions used here and below to bind to the class instance. IJH 2017-09

  selectUser = (user: LdapiUserInfo): void => {
    console.log(`User ${user} was selected in the typeahead`);
    if (user && this.usersPendingAdd.indexOf(user) < 0) {
      this.usersPendingAdd.push(user);

      // Name may be blank, so fill with username for now
      // TODO: Update this with our newly-decided UI - 2020-11-25 RM
      // this.typeahead.userName = user.username;
      // this.typeahead.fullName = this.fullname(user);
      // this.updateAddMode('addExisting');
      // this.disableAddButton = false;
    }
  }

  // noinspection JSUnusedGlobalSymbols
  // queryUser = (userName: string): void => {
  //   this.userService.typeaheadExclusive(userName, this.project.id, result => {
  //     // TODO Check userName == controller view value (cf bootstrap typeahead) else abandon.
  //     if (result.ok) {
  //       this.users = result.data.entries;
  //       if (result.data.excludedUsers) {
  //         this.excludedUsers = result.data.excludedUsers.entries;
  //       } else {
  //         this.excludedUsers = [];
  //       }

  //       this.updateAddMode();
  //     }
  //   });
  // }

  addModeText(addMode: string): string {
    return this.addModes[addMode].en;
  }

  addModeIcon(addMode: string): string {
    return this.addModes[addMode].icon;
  }

  updateAddMode(newMode?: string): void {
    if (newMode in this.addModes) {
      this.addMode = newMode;
    } else {
      // This also covers the case where newMode is undefined
      // this.calculateAddMode();
    }
  }

  // DELETE - Not needed. We're changing the UI a little. 2020-11-25 RM
  // /* Is this userName in the "excluded users" list? (I.e., users already in current project)
  //  * Note that it's not enough to check whether the "excluded users" list is non-empty,
  //  * as the "excluded users" list might include some users that had a partial match on
  //  * the given username. E.g. when creating a new user Bob Jones with username "bjones",
  //  * after typing "bjo" the "excluded users" list will include Bob Johnson (bjohnson). */
  // isExcludedUser(userName: string): User {
  //   if (!this.excludedUsers) {
  //     return;
  //   }

  //   for (let i = 0, l = this.excludedUsers.length; i < l; i++) {
  //     if (userName === this.excludedUsers[i].username ||
  //       userName === this.excludedUsers[i].name ||
  //       userName === this.excludedUsers[i].email) {
  //       return this.excludedUsers[i];
  //     }
  //   }

  //   return;
  // }

  // calculateAddMode(): void {
  //   // TODO This isn't adequate.  Need to watch the
  //   // 'typeahead.userName' and 'selection' also. CP 2013-07
  //   if (!this.typeahead.userName) {
  //     this.addMode = 'addExisting';
  //     this.disableAddButton = true;
  //     this.warningText = '';
  //   } else if (this.isExcludedUser(this.typeahead.userName)) {
  //     const excludedUser = this.isExcludedUser(this.typeahead.userName);
  //     this.addMode = 'addExisting';
  //     this.disableAddButton = true;
  //     this.warningText = excludedUser.name +
  //       ' (username \'' + excludedUser.username +
  //       '\', email ' + excludedUser.email +
  //       ') is already a member.';
  //   } else if (this.typeahead.userName.indexOf('@') !== -1) {
  //     this.addMode = 'invite';
  //     this.disableAddButton = false;
  //     this.warningText = '';
  //   } else {
  //     this.addMode = 'addExisting';
  //     this.disableAddButton = true;
  //     this.warningText = '';
  //   }
  // }

  addProjectUsers(): void {
    this.typeahead.userName = '';
    this.typeahead.fullName = '';
    var promises = this.usersPendingAdd.map(user => {
      console.log("Adding user", this.project.code, user, this.rolesService.contributor);
      return this.rolesService.lfRoleToLdRole(this.defaultAddRole.key).then(ldRole => {
        return this.projectService.updateLdapiUserRole(this.project.code, user.username, ldRole, updateResult => {
          if (updateResult.ok) {
            this.notice.push(this.notice.SUCCESS, '"' + this.fullname(user) + '" was added to ' +
              this.project.name + ' as ' + this.defaultAddRole.name);
            console.log('"' + this.fullname(user) + '" was added to ' + this.project.name + ' as ' + this.defaultAddRole.name);
          }
        });
      });
    }, this);
    this.$q.all(promises).then(result => {
      this.usersPendingAdd.splice(0);
      this.queryUserList();
    });
  }

  // noinspection JSMethodCanBeStatic
  imageSource(avatarRef: string): string {
    return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
      '/Site/views/shared/image/avatar/anonymous02.png';
  }

}

export const LdProjectMembersComponent: angular.IComponentOptions = {
  bindings: {
    // queryUserList: '&',
    // list: '<',
    project: '<',
    isAdmin: '<',
    // currentUser: '<',
    // rights: '<',
    // roles: '<'
  },
  controller: LdProjectMembersController,
  templateUrl: '/angular-app/languageforge/ldproject/ldproject-members.component.html'
};
