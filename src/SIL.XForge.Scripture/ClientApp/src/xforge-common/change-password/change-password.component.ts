import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { UserService } from '../user.service';


@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isSubmitted = false;
  errorNotMatchMessage: boolean = false;
  get formControls() { return this.changePasswordForm.controls; }

  @ViewChild('changePasswordRef') changePasswordNgForm: NgForm;

  constructor(private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router) { }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
    });
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    if (this.changePasswordForm.invalid) {
      return;
    }
    if (this.changePasswordForm.value.newPassword === this.changePasswordForm.value.confirmPassword &&
      this.changePasswordForm.value.newPassword && this.changePasswordForm.value.newPassword.length > 6
    ) {
      await this.userService.onlineChangePassword(this.changePasswordForm.value.newPassword);
      this.errorNotMatchMessage = false;
      this.changePasswordNgForm.resetForm();
      this.isSubmitted = false;
      this.snackBar.open('Password Successfully Changed', null, {
        duration: 5000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
      this.router.navigateByUrl('/home');
    } else if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
      this.errorNotMatchMessage = true;
      setTimeout(() => this.errorNotMatchMessage = false, 3000);
    }
  }
}
