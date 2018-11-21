import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { IdentityService } from '@identity/identity.service';
import { SignUpResult } from '@identity/models/sign-up-result';
import { LocationService } from '@xforge-common/location.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { SignUpComponent } from './sign-up.component';

class TestEnvironment {
  component: SignUpComponent;
  fixture: ComponentFixture<SignUpComponent>;

  mockedIdentityService: IdentityService;
  mockedLocationService: LocationService;
  mockedNoticeService: NoticeService;
  mockedActivatedRoute: ActivatedRoute;

  constructor(predefinedEmail: string = null) {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedLocationService = mock(LocationService);
    this.mockedNoticeService = mock(NoticeService);
    this.mockedActivatedRoute = mock(ActivatedRoute);

    // this is the site key for testing
    when(this.mockedIdentityService.captchaId()).thenReturn(of('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI').toPromise());
    when(this.mockedIdentityService.verifyCaptcha(anything())).thenResolve(true);
    when(this.mockedNoticeService.push(anything(), anything())).thenReturn();
    const parameters: Params = { ['e']: predefinedEmail };
    when(this.mockedActivatedRoute.queryParams).thenReturn(of(parameters));

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [SignUpComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) }
      ]
    });
    this.fixture = TestBed.createComponent(SignUpComponent);
    this.component = this.fixture.componentInstance;
  }

  get nameInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#fullName'));
  }

  get passwordInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#password'));
  }

  get emailInput(): DebugElement {
    return this.fixture.debugElement.query(By.css('#email'));
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  setInputValue(input: DebugElement, value: string): void {
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
    tick();
  }
}

describe('SignUpComponent', () => {
  it('should allow user to complete the form and register', fakeAsync(() => {
    const env = new TestEnvironment();
    const successResult: SignUpResult = { success: true };
    when(env.mockedIdentityService.signUp(anything())).thenResolve(successResult);

    env.fixture.detectChanges();
    env.setInputValue(env.nameInput, 'testUser1');
    env.setInputValue(env.passwordInput, 'password');
    env.setInputValue(env.emailInput, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.verifyCaptcha(anything())).once();
    verify(env.mockedIdentityService.signUp(anything())).once();
    verify(env.mockedLocationService.go('/home')).once();
    expect().nothing();
  }));

  it('should display errors on individual input fields', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setInputValue(env.nameInput, '');
    expect(env.component.name.hasError('required')).toBeTruthy();
    env.setInputValue(env.nameInput, 'bare');
    expect(env.component.name.hasError('required')).toBeFalsy();
    env.setInputValue(env.passwordInput, 'bones');
    expect(env.component.password.hasError('minlength')).toBeTruthy();
    env.setInputValue(env.emailInput, 'notavalidemail');
    expect(env.component.email.hasError('email')).toBeTruthy();
  }));

  it('should fill in email if user signs up through email link', fakeAsync(() => {
    const email = 'fakeemail@example.com';
    const env = new TestEnvironment(email);
    env.fixture.detectChanges();
    expect(env.emailInput.nativeElement.value).toBe(email);
  }));

  it('should display error if the sign up was unsuccessful', fakeAsync(() => {
    const env = new TestEnvironment();
    const reason = 'Duplicate email';
    const result = { success: false, reason };
    when(env.mockedIdentityService.signUp(anything())).thenResolve(result);

    env.fixture.detectChanges();
    env.setInputValue(env.nameInput, 'testUser1');
    env.setInputValue(env.passwordInput, 'password');
    env.setInputValue(env.emailInput, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.signUp(anything())).once();
    verify(env.mockedNoticeService.push(deepEqual(NoticeService.WARN), anything())).once();
    expect().nothing();
  }));

  it('should do nothing when the form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    env.clickSubmitButton();
    verify(env.mockedIdentityService.signUp(anything())).never();
    expect().nothing();
  }));
});
