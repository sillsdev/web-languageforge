import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { LfApiService } from './lf-api.service';

@Injectable()
export class AuthService {
  private loggedIn = false;

  constructor(private router: Router, private lfApiService: LfApiService) {
    this.loggedIn = !!localStorage.getItem('auth_token');
  }

  login(username: string, password: string) {
    return this.lfApiService.user_authenticate(username, password).map(response => {
      if (response.success) {
        localStorage.setItem('auth_token', response.data);
        this.loggedIn = true;
      }
      return response.success;
    });
  }
  
  logout() {
    localStorage.removeItem('auth_token');
    this.loggedIn = false;
    this.router.navigate(['auth']);
  }

  isLoggedIn() {
    return this.loggedIn;
  }
}