import { Component } from '@angular/core';

import { AuthService } from '../services/auth.service';
import { MaterializeDirective } from 'angular2-materialize';

declare var Materialize:any;

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-navbar',
  templateUrl: 'navbar.component.html'
})
export class NavbarComponent {
  constructor(public authService: AuthService) { }

  logout() {
    this.authService.logout();
    var toastContent = '<span><b>You have been logged out!</b></span>';
    Materialize.toast(toastContent, 3000, 'orange');
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
