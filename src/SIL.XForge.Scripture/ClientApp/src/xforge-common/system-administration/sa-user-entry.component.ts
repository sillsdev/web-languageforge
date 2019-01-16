import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SystemRole } from '../models/system-role';
import { User } from '../models/user';
import { NoticeService } from '../notice.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-sa-user-entry',
  templateUrl: './sa-user-entry.component.html',
  styleUrls: ['./sa-user-entry.component.scss']
})
export class SaUserEntryComponent implements OnInit {
  @Output() outputUserList: EventEmitter<boolean> = new EventEmitter<boolean>(false);

  accountUserForm: FormGroup;
  isSubmitted: boolean = false;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}';

  btnUserAdd: boolean = true;
  btnUserUpdate: boolean = false;
  btnChangePassword: boolean = false;

  showPasswordPanel: boolean = true;
  showActivateDeActivatePanel: boolean = false;

  userActivateDeactive: string;
  userLastLoginDate: string = '';
  userCreatedDate: string = '';
  headerTitle: string;

  roleList = [{ id: SystemRole.SystemAdmin, value: 'Administrator' }, { id: SystemRole.User, value: 'User' }];
  private readonly userRoleListIndex = 1;

  private _editUserId: string = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService
  ) {
    this.accountUserForm = this.formBuilder.group({
      FullName: ['', Validators.compose([Validators.required])],
      Username: [],
      Email: ['', Validators.compose([Validators.required, Validators.email, Validators.pattern(this.emailPattern)])],
      Role: ['', Validators.compose([Validators.required])],
      Password: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
      ActivateStatus: []
    });
  }

  ngOnInit(): void {
    this.editToAddReset();
  }

  @Input()
  set editUserId(value: string) {
    this._editUserId = value;
    if (this._editUserId) {
      this.headerTitle = 'Account details';
      this.showPasswordPanel = false;
      this.btnUserAdd = false;
      this.btnUserUpdate = true;
      this.btnChangePassword = true;
      this.showPasswordPanel = false;
      this.showActivateDeActivatePanel = true;
      this.getCurrentUser(this._editUserId);
    } else {
      this.headerTitle = 'New account details';
      this.editToAddReset();
      this.accountUserForm.reset();
      this.role.patchValue(this.roleList[this.userRoleListIndex].id);
    }
  }

  get editUserId() {
    return this._editUserId;
  }

  get formControls() {
    return this.accountUserForm.controls;
  }

  get fullName() {
    return this.formControls.FullName;
  }

  get email() {
    return this.formControls.Email;
  }

  get password() {
    return this.formControls.Password;
  }

  get role() {
    return this.formControls.Role;
  }

  editToAddReset(): void {
    if (!this.editUserId) {
      this.btnUserAdd = true;
      this.btnUserUpdate = false;
      this.btnChangePassword = false;
      this.showPasswordPanel = true;
      this.showActivateDeActivatePanel = false;
    }
    this.password.setValidators([Validators.required]);
    this.password.updateValueAndValidity();
  }

  onChangePassword(): void {
    this.showPasswordPanel = true;
    this.btnChangePassword = false;
    this.isSubmitted = true;
    this.password.markAsTouched();
  }

  async onUserAdd(): Promise<void> {
    this.isSubmitted = true;
    if (this.accountUserForm.invalid) {
      return;
    }

    const newUser: Partial<User> = {
      name: this.accountUserForm.value.FullName,
      username: this.accountUserForm.value.Username,
      email: this.accountUserForm.value.Email,
      role: this.accountUserForm.value.Role,
      active: true,
      password: this.accountUserForm.value.Password
    };

    await this.userService.onlineCreate(newUser);
    this.isSubmitted = false;
    this.accountUserForm.reset();
    this.noticeService.show('User account created successfully.');
    this.outputUserList.emit(true);
  }

  async onUpdate(): Promise<void> {
    if (!this.showPasswordPanel) {
      this.password.clearValidators();
      this.password.updateValueAndValidity();
    }
    if (this.accountUserForm.invalid) {
      return;
    }
    const updateUser: Partial<User> = {
      name: this.accountUserForm.value.FullName,
      username: this.accountUserForm.value.Username,
      email: this.accountUserForm.value.Email,
      role: this.accountUserForm.value.Role,
      active: this.accountUserForm.value.ActivateStatus
    };
    if (this.accountUserForm.value.Password != null) {
      // The password was changed, so we need to update the password property of our user
      updateUser.password = this.accountUserForm.value.password;
    }
    await this.userService.onlineUpdateAttributes(this.editUserId, updateUser);
    this.accountUserForm.reset();
    this.noticeService.show('User account updated.');
    this.outputUserList.emit(true);
    this.editUserId = '';
    this.editToAddReset();
  }

  onChange(value: { checked: boolean }): void {
    value.checked ? (this.userActivateDeactive = 'Activated') : (this.userActivateDeactive = 'Deactive/Invited');
  }

  getCurrentUser(userId: string): void {
    this.btnUserAdd = false;
    this.btnUserUpdate = true;
    this.btnChangePassword = true;
    this.showPasswordPanel = false;
    this.showActivateDeActivatePanel = true;
    this.userService.onlineGet(userId).subscribe(response => {
      if (response != null) {
        this.accountUserForm.patchValue({
          FullName: response.results.name,
          Username: response.results.username,
          Email: response.results.email,
          Role: response.results.role,
          ActivateStatus: response.results.active
        });
        this.userLastLoginDate = this.datePipe.transform(response.results.dateModified, 'dd MMMM yyyy');
        this.userCreatedDate = this.datePipe.transform(response.results.dateCreated, 'dd MMMM yyyy');
        this.accountUserForm.controls['ActivateStatus'].setValue(response.results.active);
        this.onChange({ checked: response.results.active });
      }
    });
  }
}
