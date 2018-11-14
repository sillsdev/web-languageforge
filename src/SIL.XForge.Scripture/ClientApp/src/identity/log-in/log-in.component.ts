import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { LogInParams } from '@identity/models/log-in-params';
import { LocationService } from '@xforge-common/location.service';
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
    private readonly activatedRoute: ActivatedRoute, private readonly locationService: LocationService,
    private readonly router: Router
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
        this.router.navigateByUrl('/home');
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
