import { OverlayContainer } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { IdentityService } from '@identity/identity.service';
import { LogInParams } from '@identity/models/log-in-params';
import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { LogInComponent } from './log-in.component';

class TestEnvironment {
  component: LogInComponent;
  fixture: ComponentFixture<LogInComponent>;

  mockedIdentityService: IdentityService;
  mockedActivatedRoute: ActivatedRoute;
  mockedLocationService: LocationService;
  mockedAuthService: AuthService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedLocationService = mock(LocationService);
    this.mockedAuthService = mock(AuthService);

    when(this.mockedActivatedRoute.queryParams).thenReturn(of({ }));

    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        UICommonModule
      ],
      declarations: [LogInComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) }
      ]
    });
    this.fixture = TestBed.createComponent(LogInComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  get logInForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get userInput(): DebugElement {
    return this.logInForm.query(By.css('input[formControlName="user"'));
  }

  get passwordInput(): DebugElement {
    return this.logInForm.query(By.css('input[formControlName="password"'));
  }

  get rememberMeCheckbox(): DebugElement {
    return this.logInForm.query(By.css('mat-checkbox[formControlName="rememberLogIn"'));
  }

  clickRememberMeCheckbox(): void {
    this.rememberMeCheckbox.nativeElement.querySelector('input').click();
    this.fixture.detectChanges();
    tick();
  }

  clickSubmitButton(): void {
    this.submitButton.nativeElement.click();
    this.fixture.detectChanges();
    tick();
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

describe('LogInComponent', () => {
  it('should log in when username and password are specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.logIn(anything())).thenResolve({ success: true, isReturnUrlTrusted: false });
    env.fixture.detectChanges();

    env.setInputValue(env.userInput, 'user');
    env.setInputValue(env.passwordInput, 'password');
    env.clickRememberMeCheckbox();
    env.clickSubmitButton();

    const logInParams: LogInParams = {
      user: 'user',
      password: 'password',
      rememberLogIn: true
    };
    verify(env.mockedIdentityService.logIn(deepEqual(logInParams))).once();
    verify(env.mockedAuthService.logIn()).once();
    expect().nothing();
  }));

  it('should display error when username and password are incorrect', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.logIn(anything())).thenResolve({ success: false, isReturnUrlTrusted: false });
    env.fixture.detectChanges();

    env.setInputValue(env.userInput, 'user');
    env.setInputValue(env.passwordInput, 'password');
    env.clickSubmitButton();

    const logInParams: LogInParams = {
      user: 'user',
      password: 'password',
      rememberLogIn: false
    };
    verify(env.mockedIdentityService.logIn(deepEqual(logInParams))).once();
    verify(env.mockedAuthService.logIn()).never();
    expect(env.getSnackBarContent()).toBe('Invalid email/username or password');
    flush();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickSubmitButton();

    verify(env.mockedIdentityService.logIn(anything())).never();
    expect().nothing();
  }));
});
