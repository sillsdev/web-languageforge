import { OverlayContainer } from '@angular-mdc/web';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { LocationService } from 'xforge-common/location.service';
import { NoticeService } from 'xforge-common/notice.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { LogInComponent } from './log-in.component';

describe('LogInComponent', () => {
  it('should log in when username and password are specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.logIn('user', 'password', true, undefined)).thenResolve({
      success: true,
      isReturnUrlTrusted: false
    });
    env.fixture.detectChanges();

    env.setTextFieldValue(env.userTextField, 'user');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.logIn('user', 'password', true, undefined)).once();
    verify(env.mockedAuthService.logIn()).once();
    expect().nothing();
  }));

  it('should display error when username and password are incorrect', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.logIn('user', 'password', true, undefined)).thenResolve({
      success: false,
      isReturnUrlTrusted: false
    });
    env.fixture.detectChanges();

    env.setTextFieldValue(env.userTextField, 'user');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.logIn('user', 'password', true, undefined)).once();
    verify(env.mockedAuthService.logIn()).never();
    verify(env.mockedNoticeService.show('Invalid email/username or password.')).once();
    expect().nothing();
    flush();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickSubmitButton();

    verify(env.mockedIdentityService.logIn(anything(), anything(), anything(), anything())).never();
    expect().nothing();
  }));

  it('should log in when paratext button is clicked', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedAuthService.externalLogIn(true)).thenResolve();
    env.fixture.detectChanges();

    env.clickLogInParatextButton();

    verify(env.mockedAuthService.externalLogIn(true)).once();
    expect().nothing();
  }));
});

class TestEnvironment {
  component: LogInComponent;
  fixture: ComponentFixture<LogInComponent>;

  mockedIdentityService: IdentityService;
  mockedActivatedRoute: ActivatedRoute;
  mockedLocationService: LocationService;
  mockedAuthService: AuthService;
  mockedNoticeService: NoticeService;

  constructor() {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedLocationService = mock(LocationService);
    this.mockedAuthService = mock(AuthService);
    this.mockedNoticeService = mock(NoticeService);

    when(this.mockedActivatedRoute.queryParams).thenReturn(of({}));
    when(this.mockedNoticeService.show(anything())).thenResolve();

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [LogInComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ]
    });
    this.fixture = TestBed.createComponent(LogInComponent);
    this.component = this.fixture.componentInstance;
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  get logInParatextButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.log-in-paratext-button'));
  }

  get logInForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get userTextField(): DebugElement {
    return this.logInForm.query(By.css('mdc-text-field[formControlName="userIdentifier"]'));
  }

  get passwordTextField(): DebugElement {
    return this.logInForm.query(By.css('mdc-text-field[formControlName="password"]'));
  }

  clickSubmitButton(): void {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  clickLogInParatextButton(): void {
    this.logInParatextButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  setTextFieldValue(textField: DebugElement, value: string): void {
    const input = textField.query(By.css('input'));
    const inputElem = input.nativeElement as HTMLInputElement;
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }
}
