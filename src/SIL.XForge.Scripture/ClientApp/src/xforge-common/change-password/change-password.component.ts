import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NoticeService } from '../notice.service';
import { UserService } from '../user.service';

/** User-facing page for changing one's own password. */
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  readonly requiredPasswordLength = 7;

  changePasswordForm: FormGroup = new FormGroup({
    newPassword: new FormControl('', [Validators.required, Validators.minLength(this.requiredPasswordLength)]),
    confirmPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private readonly userService: UserService,
    private readonly noticeService: NoticeService,
    private readonly router: Router
  ) {}

  get passwordsMatch(): boolean {
    return this.changePasswordForm.value.newPassword === this.changePasswordForm.value.confirmPassword;
  }

  get newPasswordControl(): FormControl {
    return this.changePasswordForm.controls['newPassword'] as FormControl;
  }

  get confirmPasswordControl(): FormControl {
    return this.changePasswordForm.controls['confirmPassword'] as FormControl;
  }

  async submit(): Promise<void> {
    if (this.changePasswordForm.invalid || !this.passwordsMatch) {
      return;
    }
    await this.userService.onlineChangePassword(this.changePasswordForm.value.newPassword);
    this.noticeService.show('Password changed successfully');
    this.router.navigateByUrl('/home');
  }
}
