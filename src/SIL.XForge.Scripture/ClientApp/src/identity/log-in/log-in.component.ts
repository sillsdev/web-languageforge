import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';

import { AuthService } from 'xforge-common/auth.service';
import { LocationService } from 'xforge-common/location.service';
import { NoticeService } from 'xforge-common/notice.service';
import { environment } from '../../environments/environment';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.scss']
})
export class LogInComponent {
  logInForm = new FormGroup({
    userIdentifier: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    rememberLogIn: new FormControl(true)
  });
  logInDisabled: boolean;

  constructor(
    private readonly identityService: IdentityService,
    private readonly noticeService: NoticeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly locationService: LocationService,
    private readonly authService: AuthService
  ) {}

  get siteName(): string {
    return environment.siteName;
  }

  logInWithParatext(): void {
    const rememberLogIn: boolean = this.logInForm.get('rememberLogIn').value;
    this.authService.externalLogIn(rememberLogIn);
  }

  async submit(): Promise<void> {
    if (!this.logInForm.valid) {
      return;
    }

    this.logInDisabled = true;
    const userIdentifier: string = this.logInForm.get('userIdentifier').value;
    const password: string = this.logInForm.get('password').value;
    const rememberLogIn: boolean = this.logInForm.get('rememberLogIn').value;
    const returnUrl = await this.getReturnUrl();
    const result = await this.identityService.logIn(userIdentifier, password, rememberLogIn, returnUrl);
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
      this.noticeService.show('Invalid email/username or password.');
    }
  }

  private async getReturnUrl(): Promise<string> {
    const params = await this.activatedRoute.queryParams.pipe(first()).toPromise();
    return params['returnUrl'];
  }
}
