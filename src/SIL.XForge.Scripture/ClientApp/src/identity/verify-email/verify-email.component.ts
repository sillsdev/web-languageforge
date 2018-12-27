import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent extends SubscriptionDisposable implements OnInit {
  success: boolean;
  emailPattern = '[a-zA-Z0-9.-_]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}';

  resendLinkForm = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required, Validators.pattern(this.emailPattern)])
  });

  constructor(
    private readonly identityService: IdentityService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly noticeService: NoticeService
  ) {
    super();
  }

  ngOnInit() {
    this.subscribe(this.activatedRoute.queryParams, params => {
      this.identityService.verifyEmail(params['key']).then(result => {
        this.success = result;
      });
    });
  }

  get email() {
    return this.resendLinkForm.get('email');
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }

  async resendLink(): Promise<void> {
    if (this.resendLinkForm.invalid) {
      return;
    }
    const result = await this.identityService.resendLink(this.email.value);
    if (result === 'success') {
      this.noticeService.push(NoticeService.SUCCESS, 'An email with a verification link has been sent');
    } else {
      this.noticeService.push(NoticeService.WARN, 'Could not send a link at this time');
    }
  }
}
