import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { UserService } from '../../core/api/user.service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';
import { Project } from '../../shared/model/project.model';
import { User } from '../../shared/model/user.model';
import { Rights, Role } from './user-management-app.component';

export class UserManagementMembersController implements angular.IController {
  queryUserList: () => void;
  list: any;
  project: Partial<Project>;
  roles: Role[];
  rolesAsOwner: Role[];
  rolesWithoutTechSupport: Role[];
  rights: Rights;
  currentUser: Partial<User>;

  userFilter = '';
  selected: User[] = [];

  users: User[] = [];
  excludedUsers: User[] = [];
  addModes = {
    addExisting: { en: 'Add Existing User', icon: 'fa fa-user' },
    invite: { en: 'Send Email Invite', icon: 'fa fa-envelope' }
  };
  addMode = 'addExisting';
  disableAddButton = true;
  typeahead = {
    userName: ''
  };
  warningText = '';

  private user: User;

  static $inject = ['$window', 'userService', 'projectService', 'sessionService', 'silNoticeService'];
  constructor(private $window: angular.IWindowService, private userService: UserService,
              private projectService: ProjectService, private sessionService: SessionService,
              private notice: NoticeService) { }

  $onChanges(changes: angular.IOnChangesObject): void {
    const rolesChangeObj = changes.roles as angular.IChangesObject<any>;
    if (rolesChangeObj != null && rolesChangeObj.currentValue) {
      const roles = rolesChangeObj.currentValue;
      this.rolesAsOwner = [{roleKey: 'project_manager', roleName: 'Manager and Project Owner'}];
      this.rolesWithoutTechSupport = roles.filter((elem: any) => elem.roleKey !== 'tech_support');
    }
  }

  /* ----------------------------------------------------------
   * List
   * ---------------------------------------------------------- */
  updateSelection(event: Event, user: User): void {
    const selectedIndex = this.selected.indexOf(user);
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked && selectedIndex === -1) {
      this.selected.push(user);
    } else if (!checkbox.checked && selectedIndex !== -1) {
      this.selected.splice(selectedIndex, 1);
    }
  }

  isSelected(user: User): boolean {
    return user !== null && this.selected.indexOf(user) >= 0;
  }

  getRoles(user: User) {
    if (user.id === this.project.ownerRef.id) {
      return this.rolesAsOwner;
    }

    if (user.role !== 'tech_support') {
      return this.rolesWithoutTechSupport;
    }

    return this.roles;
  }

  isRoleSelectDisabled(user: User): boolean {
    if (user.id === this.project.ownerRef.id ||
      (user.role === 'tech_support' && user.id !== this.currentUser.id) ||
      !this.rights.changeRole) { return true; }

    return false;
  }

  removeProjectUsers(): void {
    const userIds: string[] = [];
    const l = this.selected.length;
    for (let i = 0; i < l; i++) {

      // Guard against project owner being removed
      if (this.selected[i].id !== this.project.ownerRef.id) {
        userIds.push(this.selected[i].id);
      } else {
        this.notice.push(this.notice.WARN, 'Project owner cannot be removed');
      }
    }

    if (l === 0) {

      // TODO ERROR
      return;
    }

    this.projectService.removeUsers(this.project.id, userIds).then(() => {
      this.sessionService.getSession().then(session => {
        if (userIds.indexOf(session.userId()) !== -1) {
          // redirect if you just removed yourself from the project
          this.notice.push(this.notice.SUCCESS, 'You have been removed from this project');
          this.$window.location.href = '/app/projects';
        } else {
          this.queryUserList();
          this.selected = [];
          if (userIds.length === 1) {
            this.notice.push(this.notice.SUCCESS, 'The user was removed from this project');
          } else {
            this.notice.push(this.notice.SUCCESS, userIds.length +
              ' users were removed from this project');
          }
        }
      });
    });
  }

  // noinspection JSUnusedGlobalSymbols
  onRoleChange(user: User): void {
    this.projectService.updateUserRole(user.id, user.role, result => {
      if (result.ok) {
        const role = this.roles.find((obj: any) => {
          return obj.roleKey === user.role;
        });
        const message = `${user.username || user.email}'s role was changed to ${role.roleName}.`;
        this.notice.push(this.notice.SUCCESS, message);
      }
    });
  }

  /* ----------------------------------------------------------
   * Typeahead
   * ---------------------------------------------------------- */

  // arrow functions used here and below to bind to the class instance. IJH 2017-09

  selectUser = (user: User): void => {
    if (user) {
      this.user = user;

      // Name may be blank, so fill with username for now
      this.typeahead.userName = user.username;
      this.updateAddMode('addExisting');
      this.disableAddButton = false;
    }
  }

  // noinspection JSUnusedGlobalSymbols
  queryUser = (userName: string): void => {
    this.userService.typeaheadExclusive(userName, this.project.id, result => {
      // TODO Check userName == controller view value (cf bootstrap typeahead) else abandon.
      if (result.ok) {
        this.users = result.data.entries;
        if (result.data.excludedUsers) {
          this.excludedUsers = result.data.excludedUsers.entries;
        } else {
          this.excludedUsers = [];
        }

        this.updateAddMode();
      }
    });
  }

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
      this.calculateAddMode();
    }
  }

  /* Is this userName in the "excluded users" list? (I.e., users already in current project)
   * Note that it's not enough to check whether the "excluded users" list is non-empty,
   * as the "excluded users" list might include some users that had a partial match on
   * the given username. E.g. when creating a new user Bob Jones with username "bjones",
   * after typing "bjo" the "excluded users" list will include Bob Johnson (bjohnson). */
  isExcludedUser(userName: string): User {
    if (!this.excludedUsers) {
      return;
    }

    for (let i = 0, l = this.excludedUsers.length; i < l; i++) {
      if (userName === this.excludedUsers[i].username ||
        userName === this.excludedUsers[i].name ||
        userName === this.excludedUsers[i].email) {
        return this.excludedUsers[i];
      }
    }

    return;
  }

  calculateAddMode(): void {
    // TODO This isn't adequate.  Need to watch the
    // 'typeahead.userName' and 'selection' also. CP 2013-07
    if (!this.typeahead.userName) {
      this.addMode = 'addExisting';
      this.disableAddButton = true;
      this.warningText = '';
    } else if (this.isExcludedUser(this.typeahead.userName)) {
      const excludedUser = this.isExcludedUser(this.typeahead.userName);
      this.addMode = 'addExisting';
      this.disableAddButton = true;
      this.warningText = excludedUser.name +
        ' (username \'' + excludedUser.username +
        '\', email ' + excludedUser.email +
        ') is already a member.';
    } else if (this.typeahead.userName.indexOf('@') !== -1) {
      this.addMode = 'invite';
      this.disableAddButton = false;
      this.warningText = '';
    } else {
      this.addMode = 'addExisting';
      this.disableAddButton = true;
      this.warningText = '';
    }
  }

  addProjectUser(): void {
    if (this.addMode === 'addExisting') {
      const model = new User();
      model.id = this.user.id;

      // Check existing users to see if we're adding someone that already exists in the project
      this.projectService.listUsers(listResult => {
        if (listResult.ok) {
          for (let i = 0, l = listResult.data.users.length; i < l; i++) {

            // This approach works, but is unnecessarily slow.
            // We should have an "is user in project?" API,
            // rather than returning all users then searching through them in O(N) time.
            // TODO: Make an "is user in project?" query API. 2014-06 RM
            const thisUser = listResult.data.users[i];
            if (thisUser.id === model.id) {
              this.notice.push(this.notice.WARN, '\'' + this.user.name + '\' is already a member of '
                + this.project.projectName + '.');
              this.disableAddButton = true;
              return;
            }
          }

          this.projectService.updateUserRole(this.user.id, 'contributor', updateResult => {
            if (updateResult.ok) {
              this.notice.push(this.notice.SUCCESS, '\'' + this.user.name + '\' was added to ' +
                this.project.projectName + ' successfully');
              this.queryUserList();
            }
          });
        }
      });
    } else if (this.addMode === 'invite') {
      this.queryUserList();

      this.userService.sendInvite(this.typeahead.userName, 'contributor', result => {
        if (result.ok && result.data) {
          this.notice.push(this.notice.SUCCESS, '\'' + this.typeahead.userName +
            '\' was invited to join the project ' + this.project.projectName);
          this.queryUserList();
        }
      });
    }
  }

  // noinspection JSMethodCanBeStatic
  imageSource(avatarRef: string): string {
    return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
      '/Site/views/shared/image/avatar/anonymous02.png';
  }

}

export const UserManagementMembersComponent: angular.IComponentOptions = {
  bindings: {
    queryUserList: '&',
    list: '<',
    project: '<',
    currentUser: '<',
    rights: '<',
    roles: '<'
  },
  controller: UserManagementMembersController,
  templateUrl: '/angular-app/bellows/apps/usermanagement/members.component.html'
};
