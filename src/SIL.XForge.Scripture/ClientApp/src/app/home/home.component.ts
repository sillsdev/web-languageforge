import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  constructor(private readonly oauthService: OAuthService) { }

  get name() {
    const claims = this.oauthService.getIdentityClaims();
    if (claims != null) {
      return claims['name'];
    }
    return null;
  }

  login(): void {
    this.oauthService.initImplicitFlow();
  }

  logoff(): void {
    this.oauthService.logOut();
  }
}
