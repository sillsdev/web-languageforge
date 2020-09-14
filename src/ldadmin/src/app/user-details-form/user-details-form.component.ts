import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-details-form',
  templateUrl: './user-details-form.component.html',
  styleUrls: ['./user-details-form.component.scss']
})
export class UserDetailsFormComponent implements OnInit {
  formUser = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    language: new FormControl(''),
  });

  @Input()
  user: User;

  @Output()
  formSubmitted = new EventEmitter<User>();

  constructor() { }

  ngOnInit(): void {
    if (this.user) {
      this.formUser.setValue(this.user);
    }
  }

  onSubmit(): void {
    if (this.formUser.value) {
      const user = this.formUser.value as User;
      this.formSubmitted.emit(user);
    }
  }

  onReset(): void {
    if (this.user) {
      this.formUser.reset(this.user);
    }
  }

}
