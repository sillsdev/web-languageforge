import { OverlayContainer } from '@angular-mdc/web';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { LocationService } from '@xforge-common/location.service';
import { User } from '@xforge-common/models/user';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { ExternalSignUpComponent } from './external-sign-up.component';

describe('ExternalSignUpComponent', () => {
  it('should link when username and password are specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.linkAccount('user', 'password')).thenResolve({
      success: true
    });
    env.fixture.detectChanges();

    env.setTextFieldValue(env.userTextField, 'user');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.clickLinkButton();

    verify(env.mockedIdentityService.linkAccount('user', 'password')).once();
    verify(env.mockedAuthService.logIn()).once();
    expect().nothing();
  }));

  it('should display error when username and password are incorrect', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.linkAccount('user', 'password')).thenResolve({
      success: false
    });
    env.fixture.detectChanges();

    env.setTextFieldValue(env.userTextField, 'user');
    env.setTextFieldValue(env.passwordTextField, 'password');
    env.clickLinkButton();

    verify(env.mockedIdentityService.linkAccount('user', 'password')).once();
    verify(env.mockedAuthService.logIn()).never();
    expect(env.getSnackBarContent()).toEqual('Invalid email/username or password.');
    flush();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickLinkButton();

    verify(env.mockedIdentityService.linkAccount(anything(), anything())).never();
    expect().nothing();
  }));

  it('should sign up when sign up button is clicked', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.externalSignUp()).thenResolve({ success: true });
    env.fixture.detectChanges();

    env.clickSignUpButton();

    verify(env.mockedIdentityService.externalSignUp()).once();
    verify(env.mockedAuthService.logIn()).once();
    expect().nothing();
  }));
});

@Component({
  selector: 'app-avatar',
  template: '<div>Avatar</div>'
})
class MockAvatarComponent {
  @Input() user: Partial<User>;
}

class TestEnvironment {
  component: ExternalSignUpComponent;
  fixture: ComponentFixture<ExternalSignUpComponent>;

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

    when(this.mockedActivatedRoute.queryParams).thenReturn(
      of({
        name: 'Test User',
        email: 'test@example.com'
      })
    );

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [ExternalSignUpComponent, MockAvatarComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) }
      ]
    });
    this.fixture = TestBed.createComponent(ExternalSignUpComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get signUpButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#sign-up-button'));
  }

  get linkForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get userTextField(): DebugElement {
    return this.linkForm.query(By.css('mdc-text-field[formControlName="userIdentifier"]'));
  }

  get passwordTextField(): DebugElement {
    return this.linkForm.query(By.css('mdc-text-field[formControlName="password"]'));
  }

  get linkButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#link-button'));
  }

  clickLinkButton(): void {
    this.linkButton.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  clickSignUpButton(): void {
    this.signUpButton.nativeElement.click();
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

  getSnackBarContent(): string {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    const messageElement = overlayContainerElement.querySelector('mdc-snackbar-container');
    return messageElement.textContent;
  }
}
