import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';

import { User } from '@xforge-common/models/user';
import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';

@Component({
  selector: 'app-system-administration',
  templateUrl: './system-administration.component.html',
  styleUrls: ['./system-administration.component.scss']
})

export class SystemAdministrationComponent implements OnInit {
  accountUserForm: FormGroup;
  firstNameAutofilled: boolean;
  // userProject: any[] = [];
  dataSource = new MatTableDataSource<any>();

  userCount: number;
  // sfProjectUser: SFProjectUser;
  displayedColumns: string[] = ['no', 'name', 'username', 'active'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild('accountUserRef') accountUserRef;
  get formControls() { return this.accountUserForm.controls; }

  isSubmitted: boolean = false;
  userId: string = '';

  btnUserAdd: boolean = true;
  btnUserUpdate: boolean = false;
  btnChangePassword: boolean = false;

  showPasswordPanel: boolean = true;
  showActivateDeActivatePanel: boolean = false;

  addEditPanel: boolean = false;

  lblActivateDeactive: string;
  lblLastlogin: string = '';
  lblUsercreated: string = '';
  lbltitle: string = 'New account details';

  constructor(public dialog: MatDialog, private readonly datePipe: DatePipe,
    private readonly formBuilder: FormBuilder, private readonly userService: UserService,
    private readonly noticeService: NoticeService) {
    this.accountUserForm = this.formBuilder.group({
      FullName: ['', Validators.compose([Validators.required])],
      Username: ['', Validators.compose([Validators.required])],
      Email: ['', Validators.compose([Validators.required, Validators.email])],
      Role: ['', Validators.compose([Validators.required])],
      Password: ['', Validators.compose([Validators.required])],
      ActivateStatus: []
    });
    this.onUserlist();
  }

  ngOnInit() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.username.indexOf(filter) !== -1;
    };
  }
  onUserlist() {
    this.userService.onlineGetAllUser().subscribe(response => {
      this.dataSource.data = response;
      this.firstNameAutofilled = true;
      this.userCount = this.dataSource.data.length;
      this.dataSource.paginator = this.paginator;
    });
  }

  addUser(): void {
    this.lbltitle = 'New account details';
    this.btnUserAdd = true;
    this.btnUserUpdate = false;
    this.btnChangePassword = false;
    this.showPasswordPanel = true;
    this.showActivateDeActivatePanel = false;
    this.addEditPanel = true;
    this.accountUserForm.controls['Password'].setValidators([Validators.required]);
    this.accountUserForm.get('Password').updateValueAndValidity();
    this.accountUserForm.reset();
  }

  onUserAdd() {
    this.isSubmitted = true;
    if (this.accountUserForm.invalid) {
      return;
    }
    const userObj = new User({
      name: this.accountUserForm.value.FullName, username: this.accountUserForm.value.Username,
      email: this.accountUserForm.value.Email, role: this.accountUserForm.value.Role,
      active: true, password: this.accountUserForm.value.Password
    });

    this.userService.onlineAddUser(userObj).then(response => {
      this.accountUserForm.reset();
      this.noticeService.push(NoticeService.SUCCESS, 'User account created successfully');
      this.onUserlist();
      this.addEditPanel = false;
    });
  }

  editUser(userId: string) {
    this.userId = userId;
    this.getCurrentUser(userId);
    this.addEditPanel = true;
    this.lbltitle = 'Account details';
  }

  onUpdate() {
    if (this.showPasswordPanel === false) {
      this.accountUserForm.get('Password').clearValidators();
      this.accountUserForm.get('Password').updateValueAndValidity();
    }
    if (this.accountUserForm.invalid) {
      return;
    }
    const updateUser: any = {
      Id: this.userId, Name: this.accountUserForm.value.FullName,
      Username: this.accountUserForm.value.Username, Email: this.accountUserForm.value.Email,
      Role: this.accountUserForm.value.Role, Password: this.accountUserForm.value.Password,
      Active: this.accountUserForm.value.ActivateStatus
    };
    this.userService.onlineUpdateUser(updateUser).then(response => {
      this.accountUserForm.reset();
      this.onUserlist();
      this.noticeService.push(NoticeService.SUCCESS, 'User account updated.');
    });

    this.btnUserAdd = true;
    this.btnUserUpdate = false;
    this.btnChangePassword = false;
    this.showPasswordPanel = true;
    this.showActivateDeActivatePanel = false;
    this.addEditPanel = false;
    this.accountUserForm.controls['Password'].setValidators([Validators.required]);
    this.accountUserForm.get('Password').updateValueAndValidity();
  }

  onChange(value) {
    value.checked === true ? this.lblActivateDeactive = 'Activated' : this.lblActivateDeactive = 'DeActivated';
  }

  getCurrentUser(userId: string) {
    this.btnUserAdd = false;
    this.btnUserUpdate = true;
    this.btnChangePassword = true;
    this.showPasswordPanel = false;
    this.showActivateDeActivatePanel = true;
    this.userService.onlineGetUser(userId).subscribe(response => {
      if (response != null) {
        this.accountUserForm.patchValue({
          FullName: response.name,
          Username: response.username,
          Email: response.email,
          Role: response.role,
          ActivateStatus: response.active
        });
        this.lblLastlogin = this.datePipe.transform(response.dateModified, 'dd MMMM yyyy');
        this.lblUsercreated = this.datePipe.transform(response.dateCreated, 'dd MMMM yyyy');
        if (response.active === 'True') {
          this.lblActivateDeactive = 'Activated';
          this.accountUserForm.controls['ActivateStatus'].setValue(true);
        } else {
          this.lblActivateDeactive = 'DeActivated';
          this.accountUserForm.controls['ActivateStatus'].setValue(false);
        }
      }
    });
  }

  onChangePassword() {
    this.showPasswordPanel = true;
    this.btnChangePassword = false;
    this.isSubmitted = true;
    this.accountUserForm.get('Password').markAsTouched();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    this.userCount = this.dataSource.filteredData.length;
  }

  deleteProjectUser() {
    this.closeDialog();
    this.userService.onlineDeleteUser(this.userId).then(data => {
      this.noticeService.push(NoticeService.SUCCESS, 'User account deleted successfully');
      this.onUserlist();
    });
  }

  openDialog(dialogRef: any, id) {
    this.addEditPanel = false;
    this.userId = id;
    this.dialog.open(dialogRef, { disableClose: true });
  }

  closeDialog() {
    this.dialog.closeAll();
  }
}
