import { Injectable } from '@angular/core';
import { AuthConfig, JwksValidationHandler, OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { JSONAPIService } from './jsonapi.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tryLoginPromise: Promise<boolean>;

  constructor(private readonly oauthService: OAuthService, private readonly jsonApiService: JSONAPIService,
    private readonly locationService: LocationService
  ) { }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    if (claims != null) {
      return claims['sub'];
    }
    return null;
  }

  get currentUserName(): string {
    const claims = this.oauthService.getIdentityClaims();
    if (claims != null) {
      return claims['name'];
    }
    return null;
  }

  get isLoggedIn(): Promise<boolean> {
    return this.tryLoginPromise;
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  init(): void {
    const authConfig: AuthConfig = {
      issuer: this.locationService.origin,
      redirectUri: this.locationService.origin + '/home',
      clientId: 'xForge',
      scope: 'openid profile email api',
      postLogoutRedirectUri: this.locationService.origin + '/',
      silentRefreshRedirectUri: this.locationService.origin + '/silent-refresh.html',
      requireHttps: environment.production
    };

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.tryLoginPromise.then(() => this.jsonApiService.setAccessToken(this.oauthService.getAccessToken()));
      }
    });
    this.tryLoginPromise = this.oauthService.loadDiscoveryDocumentAndTryLogin()
      .then(async result => {
        let isLoggedIn = result;
        // if we weren't able to log in, try a silent refresh, this can avoid an extra page load
        // don't try to perform a silent refresh if we in the middle of an implicit flow, because it will overwrite the
        // nonce and cause it to fail
        if (!isLoggedIn && !this.isLoggingIn) {
          try {
            const event = await this.oauthService.silentRefresh();
            isLoggedIn = event.type === 'silently_refreshed';
          } catch (err) { }
        }
        if (isLoggedIn) {
          await this.jsonApiService.init(this.oauthService.getAccessToken());
          return true;
        }
        return false;
      });
  }

  logIn(): void {
    this.oauthService.initImplicitFlow();
  }

  logOut(): void {
    this.oauthService.logOut();
  }

  private get isLoggingIn(): boolean {
    // we can tell if we are in the middle of an implicit flow if a nonce is stored and nothing else
    return sessionStorage.getItem('nonce') != null && this.oauthService.getAccessToken() == null;
  }
}
