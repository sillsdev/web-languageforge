import { MdcSnackbar } from '@angular-mdc/web';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { User } from '@xforge-common/models/user';
import { environment } from '../../environments/environment';
import { IdentityService } from '../identity.service';

@Component({
  selector: 'app-external-sign-up',
  templateUrl: './external-sign-up.component.html',
  styleUrls: ['./external-sign-up.component.scss']
})
export class ExternalSignUpComponent implements OnInit {
  user: Partial<User>;
  linkForm = new FormGroup({
    userIdentifier: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  buttonsDisabled: boolean;

  constructor(
    private readonly identityService: IdentityService,
    private readonly locationService: LocationService,
    private readonly snackBar: MdcSnackbar,
    private readonly activatedRoute: ActivatedRoute,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.user = {
        name: params['name'],
        email: params['email'],
        googleId: params['googleId']
      };
    });
  }

  get siteName(): string {
    return environment.siteName;
  }

  async signUp(): Promise<void> {
    this.buttonsDisabled = true;
    const result = await this.identityService.externalSignUp();
    if (result.success) {
      if (result.returnUrl == null) {
        this.authService.logIn();
      } else {
        this.locationService.go(result.returnUrl);
      }
    } else {
      this.buttonsDisabled = false;
      this.snackBar.show('A user with the specified email address already exists.', undefined, { timeout: 6000 });
    }
  }

  onInput(propertyName: string, value: string) {
    // handle value inserted from password manager
    if (this.linkForm.get(propertyName).value !== value) {
      this.linkForm.get(propertyName).setValue(value);
    }
  }

  async link(): Promise<void> {
    if (!this.linkForm.valid) {
      return;
    }

    this.buttonsDisabled = true;
    const userIdentifier: string = this.linkForm.get('userIdentifier').value;
    const password: string = this.linkForm.get('password').value;
    const result = await this.identityService.linkAccount(userIdentifier, password);
    if (result.success) {
      if (result.returnUrl == null) {
        this.authService.logIn();
      } else {
        this.locationService.go(result.returnUrl);
      }
    } else {
      this.buttonsDisabled = false;
      this.snackBar.show('Invalid email/username or password.', undefined, { timeout: 6000 });
    }
  }
}
