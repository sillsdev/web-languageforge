import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import createAuth0Client, { Auth0Client, GetTokenSilentlyOptions, GetUserOptions } from '@auth0/auth0-spa-js';
import { Observable, of, from, throwError, BehaviorSubject, combineLatest } from 'rxjs';
import { shareReplay, catchError, concatMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly auth0$ = from(createAuth0Client({
    client_id: environment.auth0ClientId,
    domain: environment.auth0Domain,
    responseType: 'token id_token',
    redirectUri: this.location.origin + '/', // TODO: Decide where to default to. XForge uses "this.locationService.origin + '/projects'"
    scope: 'openid profile email ' + environment.scope,
    audience: environment.audience,
    // useRefreshTokens: true,
  })).pipe(
    shareReplay(1), // Ensure singleton
    catchError(err => throwError(err)),
  );

  private loggedInSubject$ = new BehaviorSubject<boolean>(null);
  private userProfileSubject$ = new BehaviorSubject<any>(null);

  // Subscribe to this to make a new call to the client's isAuthenticated() function
  isAuthenticated$ = this.auth0$.pipe(
    concatMap((client: Auth0Client) => from(client.isAuthenticated())),
    tap(res => this.loggedInSubject$.next(res))
  );

  // Subscribe to this to be passively informed as the user logs in and out
  loggedIn$ = this.loggedInSubject$.asObservable();
  // Subscribe to this to be passively informed of the user's profile as the user logs in and out
  userProfile$ = this.userProfileSubject$.asObservable();

  handleRedirectCallback$ = this.auth0$.pipe(
    concatMap((client: Auth0Client) => from(client.handleRedirectCallback()))
  );

  getTokenSilently$(options?: GetTokenSilentlyOptions): Observable<string> {
    return this.auth0$.pipe(
      concatMap((client: Auth0Client) => from(client.getTokenSilently(options)))
    );
  }

  constructor(private router: Router, private location: LocationService) {
    // On initial load, check authentication state with authorization server
    // Set up local auth streams if user is already authenticated
    this.localAuthSetup();
    // Handle redirect from Auth0 login
    this.handleAuthCallback();
  }

  // When calling, options can be passed if desired
  // https://auth0.github.io/auth0-spa-js/classes/auth0client.html#getuser
  getUser$(options?: GetUserOptions): Observable<any> {
    return this.auth0$.pipe(
      concatMap((client: Auth0Client) => from(client.getUser(options))),
      tap(user => this.userProfileSubject$.next(user)),
    );
  }

  private localAuthSetup(): void {
    // This should only be called on app initialization
    // Set up local authentication streams
    const checkAuth$ = this.isAuthenticated$.pipe(
      concatMap((loggedIn: boolean) => {
        if (loggedIn) {
          // If authenticated, get user and set in app
          // NOTE: you could pass options here if needed
          return this.getUser$();
        }
        // If not authenticated, return stream that emits 'false'
        return of(loggedIn);
      })
    );
    checkAuth$.subscribe();
  }

  login(redirectPath: string = '/'): void {
    // A desired redirect path can be passed to login method
    // (e.g., from a route guard)
    // Ensure Auth0 client instance exists
    this.auth0$.subscribe((client: Auth0Client) => {
      // Call method to log in
      client.loginWithRedirect({
        redirect_uri: this.location.origin + '/',
        appState: { target: redirectPath },
      });
    });
  }

  private handleAuthCallback(): void {
    // Call when app reloads after user logs in with Auth0
    const params = this.location.search;
    if (params.includes('code=') && params.includes('state=')) {
      let targetRoute: string; // Path to redirect to after login processsed
      const authComplete$ = this.handleRedirectCallback$.pipe(
        // Have client, now call method to handle auth callback redirect
        tap(cbRes => {
          // Get and set target redirect route from callback results
          targetRoute = cbRes.appState && cbRes.appState.target ? cbRes.appState.target : '/';
        }),
        concatMap(() => {
          // Redirect callback complete; get user and login status
          return combineLatest([
            this.getUser$(),
            this.isAuthenticated$
          ]);
        })
      );
      // Subscribe to authentication completion observable
      // Response will be an array of user and login status
      authComplete$.subscribe(([user, loggedIn]) => {
        // Redirect to target route after callback processing
        this.router.navigate([targetRoute]);
      });
    }
  }

  logout(): void {
    // Ensure Auth0 client instance exists
    this.auth0$.subscribe((client: Auth0Client) => {
      // Call method to log out
      client.logout({
        client_id: environment.auth0ClientId,
        returnTo: this.location.origin  // TODO: Consider base href in this, which would make .origin wrong
      });
    });
  }

}
