import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SystemAdminAuthGuard extends AuthGuard {
  constructor(protected readonly authService: AuthService, private readonly userService: UserService) {
    super(authService);
  }

  async canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    if (await super.canActivate(_next, _state)) {
      const user = (await this.userService.onlineGetUser(this.userService.currentUserId).toPromise()).results;
      return user.role === 'system_admin';
    }
    return false;
  }
}
