import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectRootGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly locationService: LocationService) {}

  async canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Promise<boolean> {
    if (await this.authService.isLoggedIn) {
      this.locationService.go('/');
      return false;
    }
    return true;
  }
}
