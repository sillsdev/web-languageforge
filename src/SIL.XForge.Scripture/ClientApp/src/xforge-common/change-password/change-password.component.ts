import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '../user.service';

/** User-facing page for changing one's own password. */
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  @ViewChild('changePasswordRef') changePasswordNgForm: NgForm;
  isSubmitted = false;
  private readonly requiredPasswordLength = 7;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(this.requiredPasswordLength)])],
      confirmPassword: [
        '',
        Validators.compose([Validators.required, Validators.minLength(this.requiredPasswordLength)])
      ]
    });
  }

  get formControls() {
    return this.changePasswordForm.controls;
  }

  get hasNoErrors() {
    const newPasswordLongEnough: boolean = this.changePasswordForm.controls['newPassword'].valid;
    const confirmPasswordLongEnough: boolean = this.changePasswordForm.controls['confirmPassword'].valid;
    const passwordsMatch =
      this.changePasswordForm.controls['newPassword'].value ===
      this.changePasswordForm.controls['confirmPassword'].value;
    return newPasswordLongEnough && confirmPasswordLongEnough && passwordsMatch;
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    if (!this.hasNoErrors) {
      return;
    }
    await this.userService.onlineChangePassword(this.changePasswordForm.value.newPassword);
    this.changePasswordNgForm.resetForm();
    this.noticeService.show('Password changed successfully');
    this.router.navigateByUrl('/home');
  }
}
