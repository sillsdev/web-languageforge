import { Component, OnInit, ViewChild } from '@angular/core';
import { NgModel, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { User } from '../shared/models/user';
declare var Materialize:any;

import { AuthService } from '../shared/services/auth.service';

@Component({
  moduleId: module.id,
  selector: 'logon',
  templateUrl: 'auth.component.html',
})
export class AuthComponent implements OnInit {

  private currentUser: User = new User();
  private authForm: NgModel;
  @ViewChild('authForm') currentForm: NgModel;

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.goToDashboard();
    }
  }

  onSubmit() {
    this.authService.login(this.currentUser.username, this.currentUser.password).subscribe(response => {
      if (response) {
        this.goToDashboard();
      } else {

        // try a second time, if there is no PHPSESSID cookie the first request will fail but set it
        this.authService.login(this.currentUser.username, this.currentUser.password).subscribe(response2 => {
          console.log(response2);
          if (response2) {
            this.goToDashboard();
          } else {
            var toastContent = '<span><b>Invalid email or password!</b></span>';
            Materialize.toast(toastContent, 5000, 'red');
          }
        });
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['dashboard']);
  }
}