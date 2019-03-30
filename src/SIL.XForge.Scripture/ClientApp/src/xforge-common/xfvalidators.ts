import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

const EMAIL_REGEXP = /^[a-zA-Z0-9.+_-]{1,}@[a-zA-Z0-9.-]{1,}[.]{1}[a-zA-Z]{2,}$/;

export class XFValidators {
  static email(control: AbstractControl): ValidationErrors | null {
    if (control.value == null || control.value.length === 0) {
      return null;
    }

    const result = Validators.email(control);
    if (result != null) {
      return result;
    }

    return EMAIL_REGEXP.test(control.value) ? null : { email: true };
  }

  static requireOneWithValue(formGroupPaths: string[], value: any): ValidatorFn {
    return function validate(formGroup: FormGroup) {
      let checked = 0;
      for (const formGroupPath of formGroupPaths) {
        const control = formGroup.get(formGroupPath);
        if (control.value === value) {
          checked++;
        }
      }

      if (checked < 1) {
        return {
          requireAtLeastOneWithValue: true
        };
      }

      return null;
    };
  }
}
