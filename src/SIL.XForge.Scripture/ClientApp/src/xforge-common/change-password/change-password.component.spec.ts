import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OAuthModule, OAuthService, UrlHelperService } from 'angular-oauth2-oidc';

import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [ HttpClientModule, FormsModule, ReactiveFormsModule, OAuthModule],
      declarations: [ ChangePasswordComponent ],
      providers: [OAuthService, UrlHelperService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('form invalid when empty', () => {
    expect(component.changePasswordForm.valid).toBeFalsy();
  });

  it('new password field validity', () => {
    let errors = {};
    const newPassword = component.changePasswordForm.controls['newPassword'];
    errors = newPassword.errors || {};
    console.log(errors);
    expect(errors['required']).toBeTruthy();
  });

  it('confirm password field validity', () => {
    let errors = {};
    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('new password and confirm password are equal', () => {
    // component.enabledButton = true;
    const newPassword = component.changePasswordForm.controls['newPassword'];
    newPassword.setValue('Testing');
    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    confirmPassword.setValue('Testing');
    expect(component.changePasswordForm.valid).toBeTruthy();
  });
});
