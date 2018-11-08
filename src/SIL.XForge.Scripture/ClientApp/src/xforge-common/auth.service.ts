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
        let loggedIn = result;
        if (!loggedIn) {
          try {
            const event = await this.oauthService.silentRefresh();
            loggedIn = event.type === 'silently_refreshed';
          } catch (err) {
            loggedIn = false;
          }
        }
        if (loggedIn) {
          await this.jsonApiService.init(this.oauthService.getAccessToken());
          return true;
        }
        return false;
      });
  }

  get isLoggedIn(): Promise<boolean> {
    return this.tryLoginPromise;
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken();
  }

  logIn(): void {
    this.oauthService.initImplicitFlow();
  }

  logOut(): void {
    this.oauthService.logOut();
  }
}
