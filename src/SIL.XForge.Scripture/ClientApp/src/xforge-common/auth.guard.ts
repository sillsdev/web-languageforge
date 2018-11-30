import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    if (await this.authService.isLoggedIn) {
      return true;
    }

    this.authService.logIn();
    return false;
  }
}
