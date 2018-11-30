import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { IdentityService } from '@identity/identity.service';
import { ResetPasswordParams } from '@identity/models/reset-password-params';
import { LocationService } from '@xforge-common/location.service';

interface FormGroupControls {
  [key: string]: AbstractControl;
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm = this.formBuilder.group({
    newPassword: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
    confirmPassword: ['', Validators.required]
  });
  isSubmitted: boolean = false;
  resetPasswordDisabled: boolean;
  private params: Params;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly identityService: IdentityService,
    public readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => (this.params = params));
    this.verifyToken();
  }

  get formControls(): FormGroupControls {
    return this.resetPasswordForm.controls;
  }

  get doPasswordsMatch(): boolean {
    return this.resetPasswordForm.value.newPassword === this.resetPasswordForm.value.confirmPassword;
  }

  async submit(): Promise<void> {
    if (!this.resetPasswordForm.valid) {
      return;
    }
    this.isSubmitted = true;
    if (
      this.doPasswordsMatch &&
      this.resetPasswordForm.value.newPassword &&
      this.resetPasswordForm.value.newPassword.length >= 7
    ) {
      this.resetPasswordDisabled = true;
      const resetPasswordParams = this.resetPasswordForm.value as ResetPasswordParams;

      const token = this.params['token'] as string;
      if (token) {
        resetPasswordParams.key = token;
      }
      resetPasswordParams.password = this.resetPasswordForm.value.newPassword;
      const result = await this.identityService.resetPassword(resetPasswordParams);
      if (result) {
        this.locationService.go('/home');
      }
    }
  }

  verifyToken(): void {
    const token = this.params['token'] as string;
    if (token) {
      this.identityService.verifyToken(token).then(result => {
        if (!result) {
          this.snackBar.open('The password reset request has expired. Please request another reset.', undefined);
          this.resetPasswordDisabled = true;
        }
      });
    }
  }
}
