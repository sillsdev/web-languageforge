import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { User } from '@xforge-common/models/user';
import { NoticeService } from '@xforge-common/notice.service';
import { environment } from '../../environments/environment';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-external-sign-up',
  templateUrl: './external-sign-up.component.html',
  styleUrls: ['./external-sign-up.component.scss']
})
export class ExternalSignUpComponent implements OnInit {
  user: Partial<User>;
  linkForm = new FormGroup({
    userIdentifier: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  buttonsDisabled: boolean;

  constructor(
    private readonly identityService: IdentityService,
    private readonly locationService: LocationService,
    private readonly noticeService: NoticeService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.user = {
        name: params['name'],
        email: params['email'],
        googleId: params['googleId']
      };
    });
  }

  get siteName(): string {
    return environment.siteName;
  }

  async signUp(): Promise<void> {
    this.buttonsDisabled = true;
    const result = await this.identityService.externalSignUp();
    if (result.success) {
      if (result.returnUrl == null) {
        this.authService.logIn();
      } else {
        this.locationService.go(result.returnUrl);
      }
    } else {
      this.buttonsDisabled = false;
      this.noticeService.show('A user with the specified email address already exists.');
    }
  }

  async link(): Promise<void> {
    if (!this.linkForm.valid) {
      return;
    }

    this.buttonsDisabled = true;
    const userIdentifier: string = this.linkForm.get('userIdentifier').value;
    const password: string = this.linkForm.get('password').value;
    const result = await this.identityService.linkAccount(userIdentifier, password);
    if (result.success) {
      if (result.returnUrl == null) {
        this.authService.logIn();
      } else {
        this.locationService.go(result.returnUrl);
      }
    } else {
      this.buttonsDisabled = false;
      this.noticeService.show('Invalid email/username or password.');
    }
  }
}
