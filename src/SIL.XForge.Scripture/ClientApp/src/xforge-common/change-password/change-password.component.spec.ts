import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, mock } from 'ts-mockito';

import { UserService } from '@xforge-common/user.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  const mockedUserService = mock(UserService);
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientModule, MatSnackBarModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [ChangePasswordComponent],
      providers: [
        { provide: UserService, useFactory: () => instance(mockedUserService) }
      ],
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
    expect(errors['required']).toBeTruthy();
  });

  it('confirm password field validity', () => {
    let errors = {};
    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeTruthy();
  });

  it('new password and confirm password are equal', () => {
    const newPassword = component.changePasswordForm.controls['newPassword'];
    newPassword.setValue('Testing');
    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    confirmPassword.setValue('Testing');
    expect(component.changePasswordForm.valid).toBeTruthy();
  });

  it('new password and confirm password fields are valid for minimum 7 length characters', () => {
    let errors = {};
    const newPassword = component.changePasswordForm.controls['newPassword'];
    newPassword.setValue('1234');
    errors = newPassword.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeTruthy();

    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    confirmPassword.setValue('test');
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeTruthy();
  });

  it('new password and confirm password are not equal', () => {
    const newPassword = component.changePasswordForm.controls['newPassword'];
    newPassword.setValue('Testing');
    const confirmPassword = component.changePasswordForm.controls['confirmPassword'];
    confirmPassword.setValue('Newtest');

    fixture.detectChanges();
    const changePasswordBtn = fixture.debugElement.query(By.css('button[id="btnChangePassword"]'));
    changePasswordBtn.nativeElement.click();
    const matErrorElement = fixture.debugElement.query(By.css('mat-error'));
    expect(matErrorElement.nativeElement.textContent.trim()).toContain('Passwords do not match');
  });
});
