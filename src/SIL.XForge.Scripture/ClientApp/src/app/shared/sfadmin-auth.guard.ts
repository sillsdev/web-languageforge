import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { AuthGuard } from 'xforge-common/auth.guard';
import { UserService } from 'xforge-common/user.service';
import { SFProjectRoles } from '../core/models/sfproject-roles';

@Injectable({
  providedIn: 'root'
})
export class SFAdminAuthGuard implements CanActivate {
  constructor(private readonly authGuard: AuthGuard, private readonly userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authGuard.canActivate(next, state).pipe(switchMap(() => this.allowTransition()));
  }

  allowTransition(): Observable<boolean> {
    return this.authGuard.allowTransition().pipe(
      switchMap(isLoggedIn => {
        if (isLoggedIn) {
          return this.userService.hasCurrentUserProjectRole(SFProjectRoles.ParatextAdministrator);
        }
        return of(false);
      })
    );
  }
}
