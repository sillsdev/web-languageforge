import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './services/auth.service';
import { map, concatMap } from 'rxjs/operators';
import { LocationService } from './services/location.service';

const adminUsers = [
  'robin_munn@sil.org',
  // 'robin.munn@gmail.com'
];
// TODO: Add an API endpoint like /users/%s/is-admin to check admin status rather than hard-coding the list here
// TODO: Move adminUsers into an AdminService that has a single isAdmin function, so it can be mocked

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService, private readonly location: LocationService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.auth.isAuthenticated$.pipe(
        concatMap(loggedIn => {
          if (loggedIn) {
            return this.auth.getUser$();
          } else {
            this.auth.login(state.url);
            return of(false);
          }
        }),
        map(user => adminUsers.includes(user.email))
      );
    }

}
