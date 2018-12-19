import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthGuard } from './auth.guard';
import { SystemRole } from './models/system-role';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminAuthGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard, private readonly userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authGuard.canActivate(next, state).pipe(switchMap(() => this.allowTransition()));
  }

  allowTransition(): Observable<boolean> {
    return this.authGuard.allowTransition().pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return this.userService.hasCurrentUserRole(SystemRole.SystemAdmin);
        }
        return of(false);
      })
    );
  }
}
