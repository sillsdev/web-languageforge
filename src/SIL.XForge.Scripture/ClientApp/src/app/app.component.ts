import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '@xforge-common/auth.service';
import { SystemAdminAuthGuard } from '@xforge-common/system-admin-auth.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Scripture Forge';
  today = new Date();
  version = '9.9.9';

  isSystemAdmin$: Observable<boolean>;

  constructor(private readonly authService: AuthService, private readonly systemAdminAuthGuard: SystemAdminAuthGuard) {}

  ngOnInit() {
    this.authService.init();
    this.isSystemAdmin$ = this.systemAdminAuthGuard.allowTransition();
  }

  logOut(): void {
    this.authService.logOut();
  }

  get isLoggedIn(): Promise<boolean> {
    return this.authService.isLoggedIn;
  }
}
