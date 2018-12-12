import { OverlayContainer } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { LocationService } from '@xforge-common/location.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { ResetPasswordComponent } from './reset-password.component';

class TestEnvironment {
  component: ResetPasswordComponent;
  fixture: ComponentFixture<ResetPasswordComponent>;

  mockedIdentityService: IdentityService;
  mockedActivatedRoute: ActivatedRoute;
  mockedLocationService: LocationService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedLocationService = mock(LocationService);

    when(this.mockedActivatedRoute.queryParams).thenReturn(of({ key: 'abcd1234' }));
    when(this.mockedIdentityService.verifyResetPasswordKey('abcd1234')).thenResolve(true);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [ResetPasswordComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
    this.fixture = TestBed.createComponent(ResetPasswordComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#btnResetPassword'));
  }

  get resetPasswordForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('#resetPasswordForm'));
  }

  get newPasswordInput(): DebugElement {
    return this.resetPasswordForm.query(By.css('#newPassword'));
  }

  get passwordStrengthMeter(): DebugElement {
    return this.resetPasswordForm.query(By.css('#resetPasswordStrengthMeter'));
  }

  get confirmPasswordInput(): DebugElement {
    return this.resetPasswordForm.query(By.css('#confirmPassword'));
  }

  clickSubmitButton(): void {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  setInputValue(input: DebugElement, value: string): void {
    const inputElem = input.nativeElement as HTMLInputElement;
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }

  getSnackBarContent(): string {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    const messageElement = overlayContainerElement.querySelector('snack-bar-container');
    return messageElement.textContent;
  }
}

describe('ResetPasswordComponent', () => {
  it('form invalid when empty', () => {
    const env = new TestEnvironment();

    expect(env.component.resetPasswordForm.valid).toBeFalsy();
  });

  it('new password field validity', () => {
    const env = new TestEnvironment();
    let errors = {};

    const newPassword = env.component.resetPasswordForm.controls['newPassword'];
    errors = newPassword.errors || {};

    expect(errors['required']).toBeTruthy();
  });

  it('confirm password field validity', () => {
    const env = new TestEnvironment();
    let errors = {};

    const confirmPassword = env.component.resetPasswordForm.controls['confirmPassword'];
    errors = confirmPassword.errors || {};

    expect(errors['required']).toBeTruthy();
  });

  it('new password and confirm password are equal', () => {
    const env = new TestEnvironment();

    const newPassword = env.component.resetPasswordForm.controls['newPassword'];
    newPassword.setValue('Testing');
    const confirmPassword = env.component.resetPasswordForm.controls['confirmPassword'];
    confirmPassword.setValue('Testing');

    expect(env.component.resetPasswordForm.valid).toBeTruthy();
  });

  it('new password is valid for minimum 7 length characters', () => {
    const env = new TestEnvironment();
    let errors = {};

    const newPassword = env.component.resetPasswordForm.controls['newPassword'];
    newPassword.setValue('1234');
    errors = newPassword.errors || {};

    expect(errors['required']).toBeFalsy();
    expect(errors['minlength']).toBeTruthy();
  });

  it('new password and confirm password are not equal', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.resetPassword(anything(), anything())).thenResolve(false);
    env.fixture.detectChanges();
    flush();

    env.setInputValue(env.newPasswordInput, 'Testing');
    env.setInputValue(env.confirmPasswordInput, 'Newtest');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.resetPassword(anything(), anything())).never();
    expect().nothing();
  }));

  it('should verify key on init', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    flush();

    verify(env.mockedIdentityService.verifyResetPasswordKey('abcd1234')).once();
    expect().nothing();
  }));

  it('should submit when new password and confirm password are specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.resetPassword(anything(), anything())).thenResolve(true);
    env.fixture.detectChanges();
    flush();

    env.setInputValue(env.newPasswordInput, 'newpassword');
    env.setInputValue(env.confirmPasswordInput, 'newpassword');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.resetPassword(anything(), anything())).once();
    verify(env.mockedLocationService.go('/')).once();
    expect().nothing();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    flush();

    env.clickSubmitButton();

    verify(env.mockedIdentityService.resetPassword(anything(), anything())).never();
    expect().nothing();
  }));
});
