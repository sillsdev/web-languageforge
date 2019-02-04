import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from 'xforge-common/auth.service';
import { NoticeService } from 'xforge-common/notice.service';
import { XFValidators } from 'xforge-common/xfvalidators';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  success: boolean;

  resendLinkForm = new FormGroup({
    email: new FormControl('', [XFValidators.email, Validators.required])
  });

  constructor(
    private readonly identityService: IdentityService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly noticeService: NoticeService
  ) {}

  ngOnInit() {
    this.authService.logOutNoRedirect();
    this.activatedRoute.queryParams.subscribe(params => {
      this.identityService.verifyEmail(params['key']).then(verified => {
        this.success = verified;
      });
    });
  }

  get email() {
    return this.resendLinkForm.get('email');
  }

  async resendLink(): Promise<void> {
    if (this.resendLinkForm.invalid) {
      return;
    }
    const result = await this.identityService.resendLink(this.email.value);
    if (result === 'success') {
      this.noticeService.show('An email with a verification link has been sent.');
    } else {
      this.noticeService.show('Could not send a link at this time.');
    }
  }
}
