import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';

import { SignUpParams } from '@identity/models/sign-up-params';
import { LocationService } from '@xforge-common/location.service';
import { NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent extends SubscriptionDisposable implements OnInit {
  isSubmitted: boolean = false;
  signUpForm = new FormGroup({
    name: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required, Validators.minLength(7)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    recaptcha: new FormControl(null, Validators.required)
  });
  captchaId: string;
  signUpDisabled: boolean;

  private captchaVerified: boolean;
  private params: Params;
  private emailEntry: string;

  constructor(
    private readonly identityService: IdentityService,
    private readonly locationService: LocationService,
    private readonly activatedRoute: ActivatedRoute,
    public readonly noticeService: NoticeService
  ) {
    super();
    this.identityService.captchaId().then(id => {
      this.captchaId = id;
    });
  }

  ngOnInit(): void {
    this.subscribe(this.activatedRoute.queryParams, params => {
      this.params = params;
      this.emailEntry = this.params['e'] as string;
      this.email.setValue(this.emailEntry);
    });
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
    this.isSubmitted = true;
    if (this.signUpForm.invalid || !this.captchaVerified) {
      return;
    }
    this.signUpDisabled = true;
    const duplicateEmailMessage =
      'A user with the specified email address already exists. Please use a different email address';
    const signUpParams = this.signUpForm.value as SignUpParams;
    const result = await this.identityService.signUp(signUpParams);
    if (result.success) {
      this.locationService.go('/home');
    } else {
      this.signUpDisabled = false;
      if (result.reason === 'Duplicate Email') {
        this.noticeService.push(NoticeService.WARN, duplicateEmailMessage);
      } else {
        this.noticeService.push(NoticeService.WARN, 'Your sign-up request was unsuccessful');
      }
    }
  }
}
