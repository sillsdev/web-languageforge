import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AbstractControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { anyString, capture, instance, mock, verify, when } from 'ts-mockito';

import { NoticeService } from '../notice.service';
import { UICommonModule } from '../ui-common.module';
import { UserService } from '../user.service';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('newPassword error if empty', () => {
    env.newPasswordControl.setValue('cheesesteak');
    expect(env.newPasswordControl.hasError('required')).toBe(false);
    env.fixture.detectChanges();
    const requiredErrors = env.controlErrorMessagesContaining('Required');

    env.newPasswordControl.setValue('');
    expect(env.newPasswordControl.hasError('required')).toBe(true);
    env.fixture.detectChanges();
    expect(env.controlErrorMessagesContaining('Required')).toEqual(
      requiredErrors + 1,
      'should show new Required error message'
    );
  });

  it('confirmPassword error if empty', () => {
    env.confirmPasswordControl.setValue('cheesesteak');
    expect(env.confirmPasswordControl.hasError('required')).toBe(false);

    env.confirmPasswordControl.setValue('');
    expect(env.confirmPasswordControl.hasError('required')).toBe(true);
  });

  it('newPassword error if not long enough', () => {
    env.newPasswordControl.setValue('cheesesteak');
    expect(env.newPasswordControl.hasError('minlength')).toBe(false);
    env.fixture.detectChanges();
    expect(env.controlErrorMessagesContaining('at least')).toEqual(0);

    env.newPasswordControl.setValue('short');
    expect(env.newPasswordControl.hasError('minlength')).toBe(true);
    env.fixture.detectChanges();
    expect(env.controlErrorMessagesContaining('at least')).toEqual(1);
  });

  it('different passwords dont show not-match error until both fields have content: new password', () => {
    expect(env.newPasswordControl.value).toEqual('', 'setup');
    env.confirmPasswordControl.setValue('longenoughAPPLE');
    env.confirmPasswordControl.markAsDirty();
    env.fixture.detectChanges();
    expect(env.notMatchError).toBeNull();
  });

  it('different passwords dont show not-match error until both fields have content: confirm password', () => {
    expect(env.confirmPasswordControl.value).toEqual('', 'setup');
    env.newPasswordControl.setValue('longenoughBANANA');
    env.fixture.detectChanges();
    expect(env.notMatchError).toBeNull();
  });

  it('different passwords show not-match error but after both lose focus', () => {
    env.newPasswordControl.setValue('longenoughBANANA');
    env.confirmPasswordControl.setValue('longenoughAPPLE');
    env.fixture.detectChanges();
    expect(env.component.passwordsMatch).toBe(false);
    expect(env.notMatchError).toBeNull();
    env.newPasswordControl.markAsTouched();
    env.confirmPasswordControl.markAsTouched();
    env.fixture.detectChanges();
    expect(env.component.passwordsMatch).toBe(false);
    expect(env.notMatchError).not.toBeNull();
    expect(env.notMatchError.nativeElement.textContent).toContain('same password');
  });

  it('same passwords produce valid form with no not-match error', () => {
    env.newPasswordControl.setValue('longenough');
    env.newPasswordControl.markAsTouched();
    env.confirmPasswordControl.setValue('longenough');
    env.confirmPasswordControl.markAsTouched();
    expect(env.form.valid).toBe(true);
    env.fixture.detectChanges();
    expect(env.notMatchError).toBeNull();
  });

  it('clicking submit calls library, shows notice, goes /projects', fakeAsync(() => {
    const newPassword = 'aaaaaaa';
    env.newPasswordControl.setValue(newPassword);
    env.confirmPasswordControl.setValue(newPassword);
    env.fixture.detectChanges();
    env.clickSubmit();
    verify(env.mockedUserService.onlineChangePassword(anyString())).once();
    const arg = capture(env.mockedUserService.onlineChangePassword).last()[0];
    expect(arg).toEqual(newPassword);
    verify(env.mockedNoticeService.show(anyString())).once();
    verify(env.mockedRouter.navigateByUrl(anyString())).once();
    const routerArg = capture(env.mockedRouter.navigateByUrl).last()[0];
    expect(routerArg).toEqual('/projects');
  }));

  it('does not submit if anything is invalid or not-match', async () => {
    env.form.clearValidators();
    env.newPasswordControl.setValidators(Validators.required);
    env.confirmPasswordControl.clearValidators();
    env.form.updateValueAndValidity();
    env.newPasswordControl.updateValueAndValidity();
    env.confirmPasswordControl.updateValueAndValidity();
    expect(env.form.valid).toBe(false);
    expect(env.newPasswordControl.valid).toBe(false, 'setup');
    expect(env.confirmPasswordControl.valid).toBe(true, 'setup');
    await env.component.submit();
    verify(env.mockedUserService.onlineChangePassword(anyString())).never();
    verify(env.mockedNoticeService.show(anyString())).never();
    verify(env.mockedRouter.navigateByUrl(anyString())).never();

    env.form.clearValidators();
    env.newPasswordControl.clearValidators();
    env.confirmPasswordControl.setValidators(Validators.required);
    env.form.updateValueAndValidity();
    env.newPasswordControl.updateValueAndValidity();
    env.confirmPasswordControl.updateValueAndValidity();
    expect(env.form.valid).toBe(false);
    expect(env.newPasswordControl.valid).toBe(true, 'setup');
    expect(env.confirmPasswordControl.valid).toBe(false, 'setup');
    await env.component.submit();
    verify(env.mockedUserService.onlineChangePassword(anyString())).never();
    verify(env.mockedNoticeService.show(anyString())).never();
    verify(env.mockedRouter.navigateByUrl(anyString())).never();

    env.newPasswordControl.setValue('cheeseSteak');
    env.confirmPasswordControl.setValue('hamburger');
    env.form.clearValidators();
    env.newPasswordControl.clearValidators();
    env.confirmPasswordControl.clearValidators();
    env.form.updateValueAndValidity();
    env.newPasswordControl.updateValueAndValidity();
    env.confirmPasswordControl.updateValueAndValidity();
    expect(env.component.passwordsMatch).toBe(false);
    expect(env.newPasswordControl.valid).toBe(true, 'setup');
    expect(env.confirmPasswordControl.valid).toBe(true, 'setup');
    await env.component.submit();
    verify(env.mockedUserService.onlineChangePassword(anyString())).never();
    verify(env.mockedNoticeService.show(anyString())).never();
    verify(env.mockedRouter.navigateByUrl(anyString())).never();
  });
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
      imports: [
        FormsModule,
        HttpClientModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        RouterTestingModule,
        UICommonModule
      ],
      declarations: [ChangePasswordComponent],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    this.fixture = TestBed.createComponent(ChangePasswordComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  get form(): FormGroup {
    return this.component.changePasswordForm;
  }
  get newPasswordControl(): AbstractControl {
    return this.component.newPasswordControl;
  }

  get confirmPasswordControl(): AbstractControl {
    return this.component.confirmPasswordControl;
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#submitButton'));
  }

  get notMatchError(): DebugElement {
    return this.fixture.debugElement.query(By.css('.notMatchError'));
  }

  clickSubmit(): void {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  controlErrorMessagesContaining(searchString: string): number {
    const helperTexts = this.fixture.debugElement.queryAll(By.css('mdc-helper-text'));
    return helperTexts.filter(item => item.nativeElement.textContent.includes(searchString)).length;
  }
}
