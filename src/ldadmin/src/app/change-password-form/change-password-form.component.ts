import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss']
})
export class ChangePasswordFormComponent implements OnInit {
  @Input()
  showOldPasswordField = true;
  formControl: FormGroup;

  @Output()
  changePasswordEvent = new EventEmitter<[string, string]>();

  @Output()
  cancelEvent = new EventEmitter<void>();

  constructor() { }

  passwordsMustMatch: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const password1 = control.get('newPasswordControl');
    const password2 = control.get('confirmNewPasswordControl');

    return password1.value === password2.value ? null : { confirmMismatch: true };
  }

  ngOnInit(): void {
    const fields =
      this.showOldPasswordField ? {
        oldPasswordControl: new FormControl(''),
        newPasswordControl: new FormControl(''),
        confirmNewPasswordControl: new FormControl(''),
      } : {
        newPasswordControl: new FormControl(''),
        confirmNewPasswordControl: new FormControl(''),
      };
    this.formControl = new FormGroup(fields, { validators: [this.passwordsMustMatch] });
  }

  onSubmit(): void {
    const oldPw = this.formControl?.get('oldPasswordControl')?.value;
    const newPw = this.formControl?.get('newPasswordControl')?.value;
    this.changePasswordEvent.emit([oldPw, newPw]);
  }

  onCancel(): void {
    this.cancelEvent.emit();
  }
}
