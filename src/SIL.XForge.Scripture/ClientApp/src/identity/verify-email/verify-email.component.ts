import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent extends SubscriptionDisposable implements OnInit {
  success: boolean;
  constructor(private readonly identityService: IdentityService, private readonly activatedRoute: ActivatedRoute) {
    super();
  }

  ngOnInit() {
    this.subscribe(this.activatedRoute.queryParams, params => {
      this.identityService.verifyEmail(params['email'], params['key']).then(result => {
        this.success = result;
      });
    });
  }
}
