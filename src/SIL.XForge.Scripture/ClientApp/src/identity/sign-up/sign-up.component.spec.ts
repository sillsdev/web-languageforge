import { OverlayContainer } from '@angular-mdc/web';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params } from '@angular/router';
import { RecaptchaLoaderService } from 'ng-recaptcha';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { SignUpResult } from '../models/sign-up-result';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  it('should allow user to complete the form and register', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.signUp(anything(), anything(), anything())).thenResolve(SignUpResult.Success);

    env.fixture.detectChanges();
    env.setTextFieldValue(env.nameTextField, 'testUser1');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.setTextFieldValue(env.emailTextField, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.verifyCaptcha(anything())).once();
    verify(env.mockedIdentityService.signUp(anything(), anything(), anything())).once();
    verify(env.mockedAuthService.logIn()).once();
    expect().nothing();
  }));

  it('should display errors on individual input fields', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTextFieldValue(env.nameTextField, '');
    expect(env.component.name.hasError('required')).toBeTruthy();
    env.setTextFieldValue(env.nameTextField, 'bare');
    expect(env.component.name.hasError('required')).toBeFalsy();
    env.setTextFieldValue(env.passwordTextField, 'bones');
    expect(env.component.password.hasError('minlength')).toBeTruthy();
    env.setTextFieldValue(env.emailTextField, 'notavalidemail');
    expect(env.component.email.hasError('email')).toBeTruthy();
  }));

  it('should fill in email if user signs up through email link', fakeAsync(() => {
    const email = 'fakeemail@example.com';
    const env = new TestEnvironment(email);
    env.fixture.detectChanges();
    flush();
    const inputElem = env.emailTextField.query(By.css('input')).nativeElement as HTMLInputElement;
    expect(inputElem.value).toBe(email);
  }));

  it('should display error if the sign up was unsuccessful', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.signUp(anything(), anything(), anything())).thenResolve(SignUpResult.Conflict);

    env.fixture.detectChanges();
    env.setTextFieldValue(env.nameTextField, 'testUser1');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.setTextFieldValue(env.emailTextField, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.signUp(anything(), anything(), anything())).once();
    verify(
      env.mockedNoticeService.show(
        'A user with the specified email address already exists. Please use a different email address.'
      )
    ).once();
    expect().nothing();
  }));

  it('should do nothing when the form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    env.clickSubmitButton();
    verify(env.mockedIdentityService.signUp(anything(), anything(), anything())).never();
    expect().nothing();
  }));
});

class TestEnvironment {
  component: SignUpComponent;
  fixture: ComponentFixture<SignUpComponent>;

  mockedIdentityService: IdentityService;
  mockedAuthService: AuthService;
  mockedActivatedRoute: ActivatedRoute;
  mockedRecaptchaLoaderService: RecaptchaLoaderService;
  mockedNoticeService: NoticeService;

  constructor(predefinedEmail: string = null) {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedAuthService = mock(AuthService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedRecaptchaLoaderService = mock(RecaptchaLoaderService);
    this.mockedNoticeService = mock(NoticeService);

    when(this.mockedIdentityService.verifyCaptcha(anything())).thenResolve(true);
    const parameters: Params = { ['e']: predefinedEmail };
    when(this.mockedActivatedRoute.queryParams).thenReturn(of(parameters));
    when(this.mockedRecaptchaLoaderService.ready).thenReturn(of());
    when(this.mockedNoticeService.show(anything())).thenResolve();

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [SignUpComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: RecaptchaLoaderService, useFactory: () => instance(this.mockedRecaptchaLoaderService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ]
    });
    this.fixture = TestBed.createComponent(SignUpComponent);
    this.component = this.fixture.componentInstance;
  }

  get nameTextField(): DebugElement {
    return this.fixture.debugElement.query(By.css('#fullName'));
  }

  get passwordTextField(): DebugElement {
    return this.fixture.debugElement.query(By.css('#password'));
  }

  get emailTextField(): DebugElement {
    return this.fixture.debugElement.query(By.css('#email'));
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  setTextFieldValue(textField: DebugElement, value: string): void {
    const input = textField.query(By.css('input'));
    const inputElem = input.nativeElement as HTMLInputElement;
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }

  setRecaptchaValue(): void {
    this.component.signUpForm.controls.recaptcha.setValue('4321');
    this.component.resolved('fake-verification-response');
    tick();
    this.fixture.detectChanges();
  }

  clickSubmitButton(): void {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}
