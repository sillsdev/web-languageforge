import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectHomeGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly locationService: LocationService) {}

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean> {
    return this.shouldRedirectHome()
      .pipe(
        tap(isLoggedIn => {
          if (isLoggedIn) {
            this.locationService.go('/home');
          }
        })
      )
      .pipe(map(activate => !activate));
  }

  shouldRedirectHome(): Observable<boolean> {
    return from(this.authService.isLoggedIn);
  }
}
