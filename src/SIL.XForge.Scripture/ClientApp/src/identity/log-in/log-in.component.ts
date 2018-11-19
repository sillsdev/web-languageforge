import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { IdentityService } from '../identity.service';
import { LogInParams } from '../models/log-in-params';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent implements OnInit {
  logInForm = new FormGroup({
    user: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    rememberLogIn: new FormControl(false)
  });
  logInDisabled: boolean;

  private params: Params;

  constructor(private readonly identityService: IdentityService, public readonly snackBar: MatSnackBar,
    private readonly activatedRoute: ActivatedRoute, private readonly locationService: LocationService,
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => this.params = params);
  }

  async submit(): Promise<void> {
    if (!this.logInForm.valid) {
      return;
    }

    this.logInDisabled = true;
    const returnUrl = this.params['returnUrl'] as string;
    const logInParams = this.logInForm.value as LogInParams;
    if (returnUrl != null) {
      logInParams.returnUrl = returnUrl;
    }
    const result = await this.identityService.logIn(logInParams);
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
}
