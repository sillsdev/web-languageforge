import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@xforge-common/user.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const getUserPromise = this.userService.onlineGetUser(this.userService.currentUserId).toPromise();
    return getUserPromise.then(u => {
      return u.results.role === 'system_admin';
    });
  }
}
