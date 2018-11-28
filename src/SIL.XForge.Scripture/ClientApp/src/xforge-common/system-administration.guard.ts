import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@xforge-common/user.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    const user = (await this.userService.onlineGetUser(this.userService.currentUserId).toPromise()).results;
    return user.role === 'system_admin';
  }
}
