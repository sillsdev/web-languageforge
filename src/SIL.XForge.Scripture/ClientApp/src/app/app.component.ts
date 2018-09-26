import { Component } from '@angular/core';
import { AuthConfig, JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';

import { JSONAPIService } from '@xforge-common/jsonapi.service';

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

  title = 'Scripture Forge';
  isInitialized = false;

  constructor(private readonly oauthService: OAuthService, private readonly jsonApiService: JSONAPIService) {
    this.oauthService.configure(AppComponent.authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    if (this.oauthService.hasValidAccessToken()) {
      this.init();
    }
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        if (this.isInitialized) {
          this.jsonApiService.setAccessToken(this.oauthService.getAccessToken());
        } else {
          this.init();
        }
      }
    });
    this.oauthService.loadDiscoveryDocumentAndLogin();
    this.oauthService.setupAutomaticSilentRefresh();
  }

  private init(): void {
    this.jsonApiService.init(this.oauthService.getAccessToken()).then(() => this.isInitialized = true);
  }
}
