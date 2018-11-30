import { OverlayContainer } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { IdentityService } from '@identity/identity.service';
import { LocationService } from '@xforge-common/location.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { ForgotPasswordComponent } from './forgot-password.component';

class TestEnvironment {
  component: ForgotPasswordComponent;
  fixture: ComponentFixture<ForgotPasswordComponent>;

  mockedIdentityService: IdentityService;
  mockedActivatedRoute: ActivatedRoute;
  mockedLocationService: LocationService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedLocationService = mock(LocationService);

    when(this.mockedActivatedRoute.queryParams).thenReturn(of({}));

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [ForgotPasswordComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) }
      ]
    });
    this.fixture = TestBed.createComponent(ForgotPasswordComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.submit-button'));
  }

  get forgotPasswordForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get userInput(): DebugElement {
    return this.forgotPasswordForm.query(By.css('input[formControlName="user"'));
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

describe('ForgotPasswordComponent', () => {
  it('should submit when email or username is specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.forgotPassword(anything())).thenResolve(true);
    env.fixture.detectChanges();

    env.setInputValue(env.userInput, 'user');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.forgotPassword(deepEqual('user'))).once();
    expect(env.getSnackBarContent()).toBe('Password reset email sent');
    expect().nothing();
    flush();
  }));

  it('should display error when email or username is incorrect', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.forgotPassword(anything())).thenResolve(false);
    env.fixture.detectChanges();

    env.setInputValue(env.userInput, 'user1');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.forgotPassword(deepEqual('user1'))).once();
    expect(env.getSnackBarContent()).toBe('Invalid email or username');
    flush();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickSubmitButton();

    verify(env.mockedIdentityService.forgotPassword(anything())).never();
    expect().nothing();
  }));
});
