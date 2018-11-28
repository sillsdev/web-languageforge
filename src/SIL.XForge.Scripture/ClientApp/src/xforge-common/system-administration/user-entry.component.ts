import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@xforge-common/models/user';
import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';

@Component({
  selector: 'app-user-entry',
  templateUrl: './user-entry.component.html',
  styleUrls: ['./user-entry.component.scss']
})
export class UserEntryComponent implements OnInit, OnChanges {
  accountUserForm: FormGroup;
  isSubmitted: boolean = false;
  userId: string = '';

  btnUserAdd: boolean = true;
  btnUserUpdate: boolean = false;
  btnChangePassword: boolean = false;

  addEditPanel: boolean = false;
  showPasswordPanel: boolean = true;
  showActivateDeActivatePanel: boolean = false;

  userActivateDeactive: string;
  userLastLoginDate: string = '';
  userCreatedDate: string = '';
  headerTitle: string = 'New account details';

  roleList = [{ id: 'system_admin', value: 'Administrator' }, { id: 'system_user', value: 'User' }];

  @Input() editUserId: string;
  @Output() outputUserList: EventEmitter<boolean> = new EventEmitter<boolean>(false);
  @ViewChild('accountUserFormReset') accountUserFormReset: any;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly datePipe: DatePipe,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService
  ) {
    this.accountUserForm = this.formBuilder.group({
      FullName: ['', Validators.compose([Validators.required])],
      Username: ['', Validators.compose([Validators.required])],
      Email: ['', Validators.compose([Validators.required, Validators.email])],
      Role: ['', Validators.compose([Validators.required])],
      Password: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
      ActivateStatus: []
    });
  }

  get formControls() {
    return this.accountUserForm.controls;
  }

  ngOnInit(): void {
    this.editToAddReset();
  }

  editToAddReset(): void {
    if (!this.editUserId) {
      this.btnUserAdd = true;
      this.btnUserUpdate = false;
      this.btnChangePassword = false;
      this.showPasswordPanel = true;
      this.showActivateDeActivatePanel = false;
    }
    this.accountUserForm.controls['Password'].setValidators([Validators.required]);
    this.accountUserForm.get('Password').updateValueAndValidity();
  }

  ngOnChanges(): void {
    if (this.editUserId) {
      this.headerTitle = 'Account details';
      this.showPasswordPanel = false;
      this.btnUserAdd = false;
      this.btnUserUpdate = true;
      this.btnChangePassword = true;
      this.showPasswordPanel = false;
      this.showActivateDeActivatePanel = true;
      this.getCurrentUser(this.editUserId);
    } else {
      this.editToAddReset();
      this.accountUserForm.reset();
    }
  }

  onChangePassword(): void {
    this.showPasswordPanel = true;
    this.btnChangePassword = false;
    this.isSubmitted = true;
    this.accountUserForm.get('Password').markAsTouched();
  }

  onUserAdd(): void {
    this.isSubmitted = true;
    if (this.accountUserForm.invalid) {
      return;
    }

    class PartialUser extends User {}
    const userObj = new PartialUser({
      name: this.accountUserForm.value.FullName,
      username: this.accountUserForm.value.Username,
      email: this.accountUserForm.value.Email,
      role: this.accountUserForm.value.Role,
      active: true,
      password: this.accountUserForm.value.Password
    });

    this.userService.onlineAddUser(userObj).then(() => {
      this.accountUserFormReset.reset();
      this.noticeService.push(NoticeService.SUCCESS, 'User account created successfully');
      this.addEditPanel = false;
      this.outputUserList.emit(true);
    });
  }

  onUpdate(): void {
    if (this.showPasswordPanel === false) {
      this.accountUserForm.get('Password').clearValidators();
      this.accountUserForm.get('Password').updateValueAndValidity();
    }
    if (this.accountUserForm.invalid) {
      return;
    }
    const updateUser: any = {
      Id: this.editUserId,
      Name: this.accountUserForm.value.FullName,
      Username: this.accountUserForm.value.Username,
      Email: this.accountUserForm.value.Email,
      Role: this.accountUserForm.value.Role,
      Password: this.accountUserForm.value.Password,
      Active: this.accountUserForm.value.ActivateStatus
    };
    this.userService.onlineUpdateUser(updateUser).then(() => {
      this.accountUserForm.reset();
      this.noticeService.push(NoticeService.SUCCESS, 'User account updated.');
      this.addEditPanel = false;
      this.outputUserList.emit(true);
      this.editUserId = '';
      this.editToAddReset();
    });
  }

  onChange(value: { checked: boolean }): void {
    value.checked === true ? (this.userActivateDeactive = 'Activated') : (this.userActivateDeactive = 'DeActivated');
  }

  getCurrentUser(userId: string): void {
    this.btnUserAdd = false;
    this.btnUserUpdate = true;
    this.btnChangePassword = true;
    this.showPasswordPanel = false;
    this.showActivateDeActivatePanel = true;
    this.userService.onlineGetUser(userId).subscribe(response => {
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
        if (response.results.active === 'True') {
          this.userActivateDeactive = 'Activated';
          this.accountUserForm.controls['ActivateStatus'].setValue(true);
        } else {
          this.userActivateDeactive = 'DeActivated';
          this.accountUserForm.controls['ActivateStatus'].setValue(false);
        }
      }
    });
  }
}
