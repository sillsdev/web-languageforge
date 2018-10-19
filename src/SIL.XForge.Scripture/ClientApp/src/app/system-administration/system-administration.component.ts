import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { UserService } from '@xforge-common/user.service';

@Component({
  selector: 'app-system-administration',
  templateUrl: './system-administration.component.html',
  styleUrls: ['./system-administration.component.scss']
})

export class SystemAdministrationComponent {
  @ViewChild('accountUserRef') accountUserRef;
  get formControls() { return this.accountUserForm.controls; }

  accountUserForm: FormGroup;
  isSubmitted: boolean = false;

  btnUserAdd: boolean = true;
  btnUserUpdate: boolean = false;
  btnChangePassword: boolean = false;

  showPasswordPanel: boolean = true;
  showActivateDeActivatePanel: boolean = false;

  lblActivateDeactive: string;
  lblLastlogin: string = '';
  lblUsercreated: string = '';

  constructor(private readonly formBuilder: FormBuilder, private readonly userService: UserService,
    private readonly router: Router, private readonly snakerBar: MatSnackBar) {
    this.accountUserForm = this.formBuilder.group({
      FullName: ['', Validators.compose([Validators.required])],
      Username: ['', Validators.compose([Validators.required])],
      Email: ['', Validators.compose([Validators.required, Validators.email])],
      Role: ['', Validators.compose([Validators.required])],
      Password: ['', Validators.compose([Validators.required])],
      ActivateStatus: [true]
    });
  }

  onUserAdd() {
    this.isSubmitted = true;
    if (this.accountUserForm.invalid) {
      return;
    }
    const userObj: any = {
      Name: this.accountUserForm.value.FullName, Username: this.accountUserForm.value.Username,
      Email: this.accountUserForm.value.Email, Role: this.accountUserForm.value.Role,
      Password: this.accountUserForm.value.Password, Active: false
    };
    this.userService.onlineAddUser(userObj).subscribe(response => {
      if (response != null) {
        if (response.status === true) {
          this.accountUserRef.resetForm();
          this.router.navigateByUrl('/home');
        }
        this.snackMessage(response.message);
      }
    });
  }

  onChange(value) {
    value.checked === true ? this.accountUserForm.controls['ActivateStatus'].setValue(true)
      : this.accountUserForm.controls['ActivateStatus'].setValue(false);
    value.checked === true ? this.lblActivateDeactive = 'Activated' : this.lblActivateDeactive = 'DeActivated';
  }

  onUpdate(userId: string) {
    if (this.showPasswordPanel === false) {
      this.accountUserForm.get('Password').clearValidators();
      this.accountUserForm.get('Password').updateValueAndValidity();
    }
    if (this.accountUserForm.invalid) {
      return;
    }
    const updateUser: any = {
      Id: userId, Name: this.accountUserForm.value.FullName,
      Username: this.accountUserForm.value.Username, Email: this.accountUserForm.value.Email,
      Role: this.accountUserForm.value.Role, Password: this.accountUserForm.value.Password,
      Active: this.accountUserForm.value.ActivateStatus
    };
    this.userService.onlineUpdateUser(updateUser).subscribe(response => {
      this.router.navigateByUrl('/home');
      this.snackMessage(response.message);
    });
  }

  snackMessage(response) {
    this.snakerBar.open(response, null, { duration: 5000, horizontalPosition: 'right', verticalPosition: 'top' });
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
          FullName: response.Name,
          Username: response.Username,
          Email: response.Email,
          Role: response.Role,
          ActivateStatus: response.Active
        });
        this.lblLastlogin = response.Lastlogin;
        this.lblUsercreated = response.Usercreated;
        response.Active === true ? this.lblActivateDeactive = 'Activated' : this.lblActivateDeactive = 'DeActivated';
      }
    });
  }

  onChangePassword() {
    this.showPasswordPanel = true;
    this.btnChangePassword = false;
    this.isSubmitted = true;
    this.accountUserForm.get('Password').markAsTouched();
  }
}

