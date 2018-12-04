import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthConfig, JwksValidationHandler, OAuthErrorEvent, OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../environments/environment';
import { JsonApiService } from './json-api.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tryLoginPromise: Promise<boolean>;

  constructor(
    private readonly oauthService: OAuthService,
    private readonly jsonApiService: JsonApiService,
    private readonly locationService: LocationService,
    private readonly router: Router
  ) {}

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
      requireHttps: environment.production,
      // OAuthService changes "window.location.hash" to clear the the hash fragment. This triggers the "popstate" and
      // "hashchange" browser events, which causes the Angular router to navigate. It is possible that the router
      // does not handle these events properly and navigates to the root ("/"). We workaround this issue by clearing
      // the hash through a direct call to the router.
      clearHashAfterLogin: false
    };

    this.oauthService.configure(authConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setupAutomaticSilentRefresh();
    this.oauthService.events.subscribe(event => {
      if (event.type === 'token_received') {
        this.tryLoginPromise.then(() => this.jsonApiService.setAccessToken(this.oauthService.getAccessToken()));
      }
    });
    this.tryLoginPromise = this.oauthService.loadDiscoveryDocumentAndTryLogin().then(async result => {
      let isLoggedIn = result;
      if (isLoggedIn) {
        // remove hash fragment manually (contains access and id tokens)
        this.router.navigateByUrl(this.locationService.pathname);
      }
      // if we weren't able to log in, try a silent refresh, this can avoid an extra page load.
      // don't try to perform a silent refresh if we in the middle of an implicit flow, because it will overwrite the
      // nonce and cause it to fail.
      if (!isLoggedIn && !this.isLoggingIn) {
        try {
          const event = await this.oauthService.silentRefresh();
          if (event.type === 'silently_refreshed') {
            isLoggedIn = true;
          }
        } catch (err) {
          if (err instanceof OAuthErrorEvent && err.reason['error'] === 'login_required') {
            this.oauthService.logOut(true);
          } else {
            throw err;
          }
        }
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

  externalLogIn(returnUrl?: string): void {
    const url = '/identity-api/challenge?provider=Paratext&returnUrl=' + returnUrl;
    document.location.href = url;
  }

  logOut(): void {
    this.oauthService.logOut();
  }

  private get isLoggingIn(): boolean {
    // we can tell if we are in the middle of an implicit flow if a nonce is stored and nothing else
    return sessionStorage.getItem('nonce') != null && this.oauthService.getAccessToken() == null;
  }
}
