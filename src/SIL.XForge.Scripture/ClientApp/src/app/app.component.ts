import { Component } from '@angular/core';

import { AuthService } from '@xforge-common/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Scripture Forge';
  today = new Date();
  version = '9.9.9';

  constructor(private authService: AuthService) {
    authService.init();
  }

  logOut(): void {
    this.authService.logOut();
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }
}
