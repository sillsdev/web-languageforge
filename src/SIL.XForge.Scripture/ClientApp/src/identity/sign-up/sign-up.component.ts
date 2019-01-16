import { Component, OnInit } from '@angular/core';
import { ObservableMedia } from '@angular/flex-layout';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { environment } from '../../environments/environment';
import { IdentityService } from '../identity.service';
import { SignUpResult } from '../models/sign-up-result';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent extends SubscriptionDisposable implements OnInit {
  signUpForm = new FormGroup({
    name: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(7)]),
    showPassword: new FormControl(false),
    email: new FormControl('', [Validators.required, Validators.email]),
    recaptcha: new FormControl(null, Validators.required)
  });
  signUpDisabled: boolean;
  isPasswordVisible: boolean = false;

  private captchaVerified: boolean;
  private params: Params;
  private emailEntry: string;

  constructor(
    private readonly identityService: IdentityService,
    private readonly authService: AuthService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly noticeService: NoticeService,
    public readonly media: ObservableMedia
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribe(this.activatedRoute.queryParams, params => {
      this.params = params;
      this.emailEntry = this.params['e'] as string;
      this.email.setValue(this.emailEntry);
    });
    this.verifyInvitedUser(this.emailEntry);
  }

  get captchaId(): string {
    return environment.captchaId;
  }
  get name() {
    return this.signUpForm.get('name');
  }
  get password() {
    return this.signUpForm.get('password');
  }
  get email() {
    return this.signUpForm.get('email');
  }
  get recaptcha() {
    return this.signUpForm.get('recaptcha');
  }
  get isEmailReadonly(): boolean {
    return this.emailEntry != null;
  }

  async resolved(response: string): Promise<void> {
    this.captchaVerified = await this.identityService.verifyCaptcha(response);
  }

  async submit(): Promise<void> {
    if (this.signUpForm.invalid || !this.captchaVerified) {
      return;
    }
    this.signUpDisabled = true;
    const name: string = this.name.value;
    const password: string = this.password.value;
    const email: string = this.email.value;
    const result = await this.identityService.signUp(name, password, email);
    if (result === SignUpResult.Success) {
      this.authService.logIn();
    } else {
      this.signUpDisabled = false;
      if (result === SignUpResult.Conflict) {
        this.noticeService.show(
          'A user with the specified email address already exists. Please use a different email address.'
        );
      } else {
        this.noticeService.show('Your sign-up request was unsuccessful.');
      }
    }
  }

  private async verifyInvitedUser(email: string): Promise<void> {
    if (email == null) {
      return;
    }

    const result = await this.identityService.verifyInvitedUser(email);
    if (!result) {
      this.signUpDisabled = true;
      this.noticeService.show('The invitation email has expired. Please request another invitation.');
    }
  }
}
