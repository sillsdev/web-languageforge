import * as angular from 'angular';

import { UserService } from '../../core/api/user.service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';
import { UserWithPassword } from '../../shared/model/user-password.model';
import { User } from '../../shared/model/user.model';

export class SiteAdminUsersController implements angular.IController {
  filterUsers = '';
  siteRoles = {
    none: { name: 'None' },
    user: { name: 'User' },
    project_creator: { name: 'Project Creator' },
    site_manager: { name: 'Site Manager' }
  };
  systemRoles = {
    user: { name: 'User' },
    system_admin: { name: 'Site Administrator' }
  };
  selected: User[] = [];
  users: User[] = [];
  vars = {
    selectedIndex: -1,
    editButtonName: '',
    editButtonIcon: '',
    inputfocus: false,
    record: new User(),
    showPasswordForm: false,
    state: 'add' // can be either "add" or "update"
  };
  userId: string;
  record: UserWithPassword;

  /*
   * State of the username and email address being validated:
   * 'empty'                 : no username or email entered
   * 'loading'               : username and email entered, being validated
   * 'usernameExists'        : username already exists and belongs to another account
   * 'emailExists'           : email already exists and belongs to another account
   * 'usernameAndEmailExists': both username and email already exist and belong to another account
   * 'ok'                    : username and email address are unique
  */
  uniqueUserState: string = 'empty';

  static $inject = ['$scope', 'userService',
    'sessionService', 'silNoticeService'];
  constructor(private $scope: angular.IScope, private userService: UserService,
              private sessionService: SessionService, private notice: NoticeService) { }

  $onInit() {
    this.sessionService.getSession().then(session => {
      this.userId = session.userId();
    });

    this.$scope.$watch(() => this.vars.record.id, (newId: string) => {
      if (newId) {
        this.userService.read(newId, result => {
          this.record = result.data;
          this.uniqueUserState = 'empty';
        });
      } else {
        this.record = new User();
        this.record.role = 'user';
      }
    });

  }

  focusInput(): void {
    this.vars.inputfocus = true;
  }

  blurInput(): void {
    this.vars.inputfocus = false;
  }

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

  queryUsers(invalidateCache: boolean): void {
    const forceReload = (invalidateCache || (!this.users) || (this.users.length === 0));
    if (forceReload) {
      this.userService.list(result => {
        if (result.ok) {
          this.users = result.data.entries;
        } else {
          this.users = [];
        }
      });
    }
  }

  selectRow(index: number, user: User = new User()): void {
    this.vars.selectedIndex = index;
    if (index < 0) {
      this.vars.record = new User();
      this.vars.record.role = 'user';
    } else {
      this.vars.record = user;
      this.vars.editButtonName = 'Save';
      this.vars.editButtonIcon = 'floppy-o';
      this.vars.state = 'update';
      this.hidePasswordForm();
    }
  }

  addRecord(): void {
    this.selectRow(-1); // Make a blank entry in the "User data" area
    // TODO: Signal the user somehow that he should type in the user data area and hit Save
    // Right now this is not intuitive, so we need some kind of visual signal
    this.vars.editButtonName = 'Add';
    this.vars.editButtonIcon = 'plus';
    this.vars.state = 'add';
    this.showPasswordForm();
    this.focusInput();
  }

  siteRoleChanged(site: string, role: string): void {
    this.record.siteRole[site] = role;
  }

  // noinspection JSUnusedGlobalSymbols
  resetValidateUserForm(): void {
    this.uniqueUserState = 'empty';
  }

  // Check for unique username and email
  checkUniqueUser(): void {
    if (this.record.email) {
      this.uniqueUserState = 'loading';
      this.userService.checkUniqueIdentity(this.record.id, this.record.username,
        this.record.email, result => {
          if (result.ok) {
            this.uniqueUserState = result.data;
          }
        }
      );
    }
  }

  updateRecord(record: UserWithPassword): void {
    if (record.id === undefined) {
      // add a new user
      record.id = '';

      this.userService.create(record, result => {
        if (result.ok) {
          if (result.data) {
            this.notice.push(this.notice.SUCCESS, 'The user ' + record.email +
              ' was successfully added');
          } else {
            this.notice.push(this.notice.ERROR, 'API Error: the username/email already exists!' +
              '  (this should not happen)');
          }
        }

      });

      this.record = new User();
      this.record.role = 'user';
      this.focusInput();

    } else {
      // update an existing user
      this.userService.update(record, result => {
        if (result.ok) {
          if (result.data) {
            this.notice.push(this.notice.SUCCESS, 'The user ' + record.username +
              ' was successfully updated');
          }
        }
      });

      if (record.password) {
        this.changePassword(record);
        this.record.password = '';
      }

      this.blurInput();
    }

    this.uniqueUserState = 'empty';
    this.queryUsers(true);
  }

  removeUsers(): void {
    const userIds: string[] = [];
    const l = this.selected.length;
    for (let i = 0; i < l; i++) {
      userIds.push(this.selected[i].id);
    }

    if (l === 0) {
      // TODO ERROR
      return;
    }

    this.userService.remove(userIds, result => {
      if (result.ok) {
        if (result.data === 1) {
          this.notice.push(this.notice.SUCCESS, '1 user was deleted');
        } else if (result.data > 1) {
          this.notice.push(this.notice.SUCCESS, result.data + ' users were deleted');
        } else {
          this.notice.push(this.notice.ERROR, 'Error deleting one or more users');
        }
      }

      // Whether result was OK or error, wipe selected list and reload data
      this.selected = [];
      this.vars.selectedIndex = -1;
      this.vars.editButtonName = null;
      this.record = new User();
      this.queryUsers(true);
    });
  }

  banUser(record: UserWithPassword): void {
    this.userService.ban(record.id, result => {
      if (result.ok) {
        if (result.data !== false) {
          this.notice.push(this.notice.SUCCESS, 'The user ' + record.username + ' was banned');
        } else {
          this.notice.push(this.notice.ERROR, 'Error banning ' + record.username);
        }
      }

      // wipe selected list and reload data
      this.selected = [];
      this.vars.selectedIndex = -1;
      this.vars.editButtonName = null;
      this.record = new User();
      this.queryUsers(true);
    });
  }

  changePassword(record: UserWithPassword): void {
    this.userService.changePassword(record.id, record.password, result => {
      if (result.ok) {
        this.notice.push(this.notice.SUCCESS, 'Password for ' + record.name + ' updated successfully');
      }
    });
  }

  showPasswordForm(): void {
    this.vars.showPasswordForm = true;
  }

  hidePasswordForm(): void {
    this.vars.showPasswordForm = false;
  }

  togglePasswordForm(): void {
    this.vars.showPasswordForm = !this.vars.showPasswordForm;
  }

}

export const SiteAdminUsersComponent: angular.IComponentOptions = {
  controller: SiteAdminUsersController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/site-admin-users.component.html'
};
