import { Component } from '@angular/core';

import { AuthService } from '@xforge-common/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent {
  constructor(private readonly authService: AuthService) {}

  get name(): string {
    return this.authService.currentUserName;
  }
}
