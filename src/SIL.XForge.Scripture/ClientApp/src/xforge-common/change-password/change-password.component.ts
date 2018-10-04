import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '@xforge-common/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  isSubmitted = false;
  errorNotMatchMessage: boolean = false;
  callBackStatusMessage: string;
  callBackMessageDisplay: boolean = false;

  get formControls() { return this.changePasswordForm.controls; }

  constructor(private readonly formBuilder: FormBuilder, private readonly userService: UserService) { }

  ngOnInit() {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    this.callBackMessageDisplay = false;
    if (this.changePasswordForm.invalid) {
      return;
    }
    if (this.changePasswordForm.value.newPassword === this.changePasswordForm.value.confirmPassword &&
      this.changePasswordForm.value.newPassword && this.changePasswordForm.value.newPassword.length > 6) {
        this.userService.changePassword(this.changePasswordForm.value.newPassword).then(data => {
        this.callBackStatusMessage = 'Password Successfully Changed';
        this.callBackMessageDisplay = true;
          this.errorNotMatchMessage = false;
        this.changePasswordForm.reset();
        this.isSubmitted = false;
      });
    } else if (this.changePasswordForm.value.newPassword !== this.changePasswordForm.value.confirmPassword) {
      this.errorNotMatchMessage = true;
      setTimeout(() => {
      this.errorNotMatchMessage = false;
    }, 3000);
    }
  }
}
