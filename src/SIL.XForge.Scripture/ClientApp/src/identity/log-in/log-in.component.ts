import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  logInForm = new FormGroup({
    user: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    rememberLogIn: new FormControl(false)
  });
  logInDisabled: boolean;

  constructor(
    private readonly identityService: IdentityService,
    public readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly locationService: LocationService,
    private readonly authService: AuthService
  ) {}

  signInWithParatext(): void {
    this.authService.externalLogIn();
  }

  async submit(): Promise<void> {
    if (!this.logInForm.valid) {
      return;
    }

    this.logInDisabled = true;
    const user: string = this.logInForm.get('user').value;
    const password: string = this.logInForm.get('password').value;
    const rememberLogIn: boolean = this.logInForm.get('rememberLogIn').value;
    const returnUrl = await this.getReturnUrl();
    const result = await this.identityService.logIn(user, password, rememberLogIn, returnUrl);
    if (result.success) {
      if (returnUrl == null) {
        this.authService.logIn();
      } else if (result.isReturnUrlTrusted) {
        this.locationService.go(returnUrl);
      } else {
        throw new Error('Invalid return URL.');
      }
    } else {
      this.logInDisabled = false;
      this.snackBar.open('Invalid email/username or password', undefined, { duration: 5000 });
    }
  }

  private async getReturnUrl(): Promise<string> {
    const params = await this.activatedRoute.queryParams.pipe(first()).toPromise();
    return params['returnUrl'];
  }
}
