import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  userProfile$ = this.auth.userProfile$;
  loggedIn$ = this.auth.loggedIn$;

  menuOpen = false;

  constructor(readonly auth: AuthService) { }

  ngOnInit(): void {
  }

  login(): void {
    this.auth.login();
    // TODO: https://stackoverflow.com/questions/2587677/avoid-browser-popup-blockers suggests we should open a popup window here,
    // then pass it to login() as a parameter to loginWithPopup() to persuade Firefox to let our popup through
  }

  logout(): void {
    this.auth.logout();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  openMenu(): void {
    this.menuOpen = true;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  get menuIcon(): string {
    return this.menuOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
  }

}
