import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from 'xforge-common/auth.service';
import { LocationService } from 'xforge-common/location.service';
import { IdentityService } from '../identity.service';

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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly identityService: IdentityService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly locationService: LocationService
  ) {}

  ngOnInit(): Promise<void> {
    this.authService.logOutNoRedirect();
    return this.verifyKey();
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
      const key = await this.getKey();
      const password: string = this.resetPasswordForm.get('newPassword').value;
      const result = await this.identityService.resetPassword(key, password);
      if (result) {
        this.locationService.go('/');
      }
    }
  }

  async verifyKey(): Promise<void> {
    const key = await this.getKey();
    if (key == null) {
      return;
    }

    const result = await this.identityService.verifyResetPasswordKey(key);
    if (!result) {
      this.snackBar.open('The password reset request has expired. Please request another reset.');
      this.resetPasswordDisabled = true;
    }
  }

  private async getKey(): Promise<string> {
    const params = await this.activatedRoute.queryParams.pipe(first()).toPromise();
    return params['key'];
  }
}
