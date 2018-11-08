import { Component } from '@angular/core';

import { AuthService } from '@xforge-common/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Scripture Forge';

  constructor(authService: AuthService) {
    authService.init();
  }
}
