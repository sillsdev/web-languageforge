import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { LocationService } from '@xforge-common/location.service';
import { IdentityService } from '../identity.service';

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

  constructor(
    private readonly identityService: IdentityService,
    public readonly snackBar: MatSnackBar,
    private readonly locationService: LocationService
  ) {}

  async submit(): Promise<void> {
    if (!this.forgotPasswordForm.valid) {
      return;
    }

    this.forgotPasswordDisabled = true;
    const result = await this.identityService.forgotPassword(this.forgotPasswordForm.controls['user'].value);
    if (result) {
      this.snackBar.open('Password reset email sent', undefined);
    } else {
      this.forgotPasswordDisabled = false;
      this.snackBar.open('Invalid email or username', undefined, { duration: 5000 });
    }
  }
}
