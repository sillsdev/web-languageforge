import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { LocationService } from '@xforge-common/location.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { SignUpResult } from '../models/sign-up-result';
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

  get showPasswordCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('mat-checkbox[formControlName="showPassword"'));
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

  clickCheckbox(checkbox: DebugElement): void {
    checkbox.nativeElement.querySelector('input').click();
    this.fixture.detectChanges();
    flush();
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
    when(env.mockedIdentityService.signUp(anything(), anything(), anything(), anything()))
      .thenResolve(SignUpResult.Success);

    env.fixture.detectChanges();
    env.setInputValue(env.nameInput, 'testUser1');
    env.setInputValue(env.passwordInput, 'password');
    env.setInputValue(env.emailInput, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.verifyCaptcha(anything())).once();
    verify(env.mockedIdentityService.signUp(anything(), anything(), anything(), anything())).once();
    verify(env.mockedLocationService.go('/')).once();
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
    when(env.mockedIdentityService.signUp(anything(), anything(), anything(), anything()))
      .thenResolve(SignUpResult.Conflict);

    env.fixture.detectChanges();
    env.setInputValue(env.nameInput, 'testUser1');
    env.setInputValue(env.passwordInput, 'password');
    env.setInputValue(env.emailInput, 'test@example.com');
    env.setRecaptchaValue();
    env.clickSubmitButton();

    verify(env.mockedIdentityService.signUp(anything(), anything(), anything(), anything())).once();
    verify(env.mockedNoticeService.push(deepEqual(NoticeService.WARN), anything())).once();
    expect().nothing();
  }));

  it('should verify the inputType changes when the checkbox is changed.', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    expect(env.passwordInput.nativeElement.attributes.type.value).toBe('password');
    env.clickCheckbox(env.showPasswordCheckbox);
    expect(env.passwordInput.nativeElement.attributes.type.value).toBe('text');
    env.clickCheckbox(env.showPasswordCheckbox);
    expect(env.passwordInput.nativeElement.attributes.type.value).toBe('password');
    flush();
  }));

  it('should do nothing when the form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    env.clickSubmitButton();
    verify(env.mockedIdentityService.signUp(anything(), anything(), anything(), anything())).never();
    expect().nothing();
  }));
});
