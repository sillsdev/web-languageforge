import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { NoticeService } from 'xforge-common/notice.service';
import { IdentityService } from '../identity.service';

/** Helps user initiate a password reset. Found from the login page. */
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  forgotPasswordForm = new FormGroup({
    user: new FormControl('', Validators.required)
  });
  forgotPasswordDisabled: boolean;

  constructor(private readonly identityService: IdentityService, private readonly noticeService: NoticeService) {}

  async submit(): Promise<void> {
    if (!this.forgotPasswordForm.valid) {
      return;
    }

    this.forgotPasswordDisabled = true;
    const result = await this.identityService.forgotPassword(this.forgotPasswordForm.controls['user'].value);
    if (result) {
      this.noticeService.show('Password reset email sent');
    } else {
      this.forgotPasswordDisabled = false;
      this.noticeService.show('Invalid email or username');
    }
  }
}
