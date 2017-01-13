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

  currentUser = new User(null, '', '', '', '', 'vistor');
  submitted = false;
  authForm: NgModel;
  @ViewChild('authForm') currentForm: NgModel;

  constructor(
    private router: Router,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
  }

  onSubmit() {
    this.submitted = true;
    this.authService.login(this.currentUser).then(response => {
      if (response) {
        this.goToDashboard();
      } else {
        var toastContent = '<span><b>Invalid email or password!</b></span>';
        Materialize.toast(toastContent, 5000, 'red');
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['dashboard']);
  }
}