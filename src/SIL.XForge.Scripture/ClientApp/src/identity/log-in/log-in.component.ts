import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params } from '@angular/router';

import { LogInParams } from '@identity/models/log-in-params';
import { LocationService } from '@xforge-common/location.service';
import { isLocalUrl } from '@xforge-common/utils';
import { IdentityService } from '../identity.service';

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
    private readonly activatedRoute: ActivatedRoute, private readonly locationService: LocationService
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
      if (result.isReturnUrlTrusted || isLocalUrl(returnUrl)) {
        this.locationService.go(returnUrl);
      } else if (returnUrl == null) {
        this.locationService.go('/');
      } else {
        throw new Error('Invalid return URL.');
      }
    } else {
      this.logInDisabled = false;
      this.snackBar.open('Invalid email/username or password', undefined, { duration: 5000 });
    }
  }
}
