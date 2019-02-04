import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { anyString, capture, instance, mock, verify, when } from 'ts-mockito';

import { NoticeService } from '../notice.service';
import { UserService } from '../user.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('form invalid when empty', () => {
    expect(env.newPasswordControl.value).toEqual('', 'setup');
    expect(env.confirmPasswordControl.value).toEqual('', 'setup');
    expect(env.component.changePasswordForm.valid).toBe(false);
  });

  it('new password field validity', () => {
    let errors = {};
    const newPassword = env.newPasswordControl;
    errors = newPassword.errors || {};
    expect(errors['required']).toBeDefined();
  });

  it('confirm password field validity', () => {
    let errors = {};
    const confirmPassword = env.confirmPasswordControl;
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeDefined();
  });

  it('valid when new password and confirm password are equal', () => {
    const newPassword = env.newPasswordControl;
    newPassword.setValue('Testing');
    const confirmPassword = env.confirmPasswordControl;
    confirmPassword.setValue('Testing');
    env.fixture.detectChanges();
    expect(env.component.changePasswordForm.valid).toBe(true);
  });

  it('new password and confirm password fields are valid for minimum 7 length characters', () => {
    let errors = {};
    const newPassword = env.newPasswordControl;
    newPassword.setValue('1234');
    env.fixture.detectChanges();
    errors = newPassword.errors || {};
    expect(errors['required']).toBeUndefined();
    expect(errors['minlength']).toBeDefined();
    newPassword.setValue('1234567');
    env.fixture.detectChanges();
    errors = newPassword.errors || {};
    expect(errors['required']).toBeUndefined();
    expect(errors['minlength']).toBeUndefined();

    const confirmPassword = env.confirmPasswordControl;
    confirmPassword.setValue('test');
    env.fixture.detectChanges();
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeUndefined();
    expect(errors['minlength']).toBeDefined();
    confirmPassword.setValue('test123');
    env.fixture.detectChanges();
    errors = confirmPassword.errors || {};
    expect(errors['required']).toBeUndefined();
    expect(errors['minlength']).toBeUndefined();
  });

  it('not submittable if fields are less than min length', fakeAsync(() => {
    const shortPassword = '1234';
    const acceptablePassword = '1234567';
    env.newPasswordControl.setValue(shortPassword);
    env.confirmPasswordControl.setValue(shortPassword);
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(false);
    expect(env.newPasswordControl.errors['minlength']).toBeDefined();
    expect(env.confirmPasswordControl.errors['minlength']).toBeDefined();
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(2);
    expect(env.errorElements[0].nativeElement.textContent).toContain('at least 7');
    expect(env.errorElements[1].nativeElement.textContent).toContain('at least 7');
    env.newPasswordControl.setValue(acceptablePassword);
    env.confirmPasswordControl.setValue(acceptablePassword);
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(true);
    expect(env.newPasswordControl.errors).toBeNull();
    expect(env.confirmPasswordControl.errors).toBeNull();
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(0);
  }));

  it('same passwords do not produce not-match error', fakeAsync(() => {
    env.newPasswordControl.setValue('aaaaaaaa');
    env.confirmPasswordControl.setValue('aaaaaaaa');
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(true);
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(0);
  }));

  it('different passwords produce not-match error', fakeAsync(() => {
    env.newPasswordControl.setValue('aaaaaaaa');
    env.confirmPasswordControl.setValue('bbbbbbbb');
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(false);
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(1);
    expect(env.errorElements[0].nativeElement.textContent).toContain('not match');
  }));

  it('not-match error does not appear until text is entered in both fields: confirm field', fakeAsync(() => {
    env.newPasswordControl.setValue('aaaaaaaa');
    expect(env.confirmPasswordControl.value).toEqual('', 'setup');
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(false);
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(1);
    expect(env.errorElements[0].nativeElement.textContent).not.toContain('not match');
  }));

  it('not-match error does not appear until text is entered in both fields: new password field', fakeAsync(() => {
    env.confirmPasswordControl.setValue('aaaaaaaa');
    expect(env.newPasswordControl.value).toEqual('', 'setup');
    env.fixture.detectChanges();
    expect(env.component.hasNoErrors).toBe(false);
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(1);
    expect(env.errorElements[0].nativeElement.textContent).not.toContain('not match');
  }));

  it('not submittable if only text in confirm field', fakeAsync(() => {
    env.confirmPasswordControl.setValue('aaaaaaaa');
    env.fixture.detectChanges();
    expect(env.newPasswordControl.value).toEqual('', 'setup');
    expect(env.component.hasNoErrors).toBe(false);
    expect(env.newPasswordControl.errors['required']).toBeDefined();
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(1);
    expect(env.errorElements[0].nativeElement.textContent).toContain('is required');
  }));

  it('not submittable if only text in new password field', fakeAsync(() => {
    env.newPasswordControl.setValue('aaaaaaaa');
    env.fixture.detectChanges();
    expect(env.confirmPasswordControl.value).toEqual('', 'setup');
    expect(env.component.hasNoErrors).toBe(false);
    expect(env.confirmPasswordControl.errors['required']).toBeDefined();
    env.clickSubmit();
    expect(env.errorElements.length).toEqual(1);
    expect(env.errorElements[0].nativeElement.textContent).toContain('is required');
  }));

  it('submit sets flag, calls library, shows notice, goes /home', fakeAsync(() => {
    expect(env.component.isSubmitted).toBe(false, 'setup');
    const newPassword = 'aaaaaaa';
    env.newPasswordControl.setValue(newPassword);
    env.confirmPasswordControl.setValue(newPassword);
    env.fixture.detectChanges();
    env.submitButton.nativeElement.click();
    env.fixture.detectChanges();
    flush();
    expect(env.component.isSubmitted).toBe(true);
    verify(env.mockedUserService.onlineChangePassword(anyString())).once();
    const arg = capture(env.mockedUserService.onlineChangePassword).last()[0];
    expect(arg).toEqual(newPassword);
    verify(env.mockedNoticeService.show(anyString())).once();
    verify(env.mockedRouter.navigateByUrl(anyString())).once();
    const routerArg = capture(env.mockedRouter.navigateByUrl).last()[0];
    expect(routerArg).toEqual('/home');
  }));

  it('if not submittable, submit sets flag but does not otherwise process', fakeAsync(() => {
    expect(env.component.isSubmitted).toBe(false, 'setup');
    const newPassword = 'short';
    env.newPasswordControl.setValue(newPassword);
    env.confirmPasswordControl.setValue(newPassword);
    expect(env.component.hasNoErrors).toBe(false, 'setup');
    env.fixture.detectChanges();
    env.submitButton.nativeElement.click();
    env.fixture.detectChanges();
    flush();
    expect(env.component.isSubmitted).toBe(true);
    verify(env.mockedUserService.onlineChangePassword(anyString())).never();
    verify(env.mockedNoticeService.show(anyString())).never();
    verify(env.mockedRouter.navigateByUrl(anyString())).never();
  }));
});

class TestEnvironment {
  component: ChangePasswordComponent;
  fixture: ComponentFixture<ChangePasswordComponent>;
  mockedUserService: UserService;
  mockedNoticeService: NoticeService;
  mockedRouter: Router;

  constructor() {
    this.mockedUserService = mock(UserService);
    this.mockedNoticeService = mock(NoticeService);
    this.mockedRouter = mock(Router);
    when(this.mockedUserService.onlineChangePassword(anyString())).thenResolve();
    when(this.mockedNoticeService.show(anyString())).thenResolve();
    when(this.mockedRouter.navigateByUrl(anyString())).thenResolve(true);

    TestBed.configureTestingModule({
      imports: [FormsModule, HttpClientModule, MatSnackBarModule, ReactiveFormsModule, RouterTestingModule],
      declarations: [ChangePasswordComponent],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    this.fixture = TestBed.createComponent(ChangePasswordComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  get newPasswordControl(): AbstractControl {
    return this.component.changePasswordForm.controls['newPassword'];
  }

  get confirmPasswordControl(): AbstractControl {
    return this.component.changePasswordForm.controls['confirmPassword'];
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#btnChangePassword'));
  }

  get errorElements(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('mat-error'));
  }

  clickSubmit() {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}
