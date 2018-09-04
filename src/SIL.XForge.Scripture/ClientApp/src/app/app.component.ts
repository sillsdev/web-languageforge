import { Component } from '@angular/core';
import { OAuthService, AuthConfig, JwksValidationHandler } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private static readonly authConfig: AuthConfig = {
    issuer: window.location.origin,
    redirectUri: window.location.origin + '/home',
    clientId: 'xForge',
    scope: 'openid profile email api',
    postLogoutRedirectUri: window.location.origin + '/',
    silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html'
  };

  title = 'app';

  constructor(private readonly oauthService: OAuthService) {
    this.oauthService.configure(AppComponent.authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndLogin();
    this.oauthService.setupAutomaticSilentRefresh();
  }

  get isLoggedIn(): boolean {
    return this.oauthService.hasValidIdToken();
  }
}
