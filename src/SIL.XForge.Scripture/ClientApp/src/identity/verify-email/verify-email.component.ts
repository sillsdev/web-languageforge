import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { environment } from '../../environments/environment';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent extends SubscriptionDisposable implements OnInit {
  success: boolean;
  issueEmail: string = environment.issueEmail;

  constructor(
    private readonly identityService: IdentityService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
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

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }
}
