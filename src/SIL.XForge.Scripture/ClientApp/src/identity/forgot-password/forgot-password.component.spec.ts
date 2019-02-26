import { OverlayContainer } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { LocationService } from 'xforge-common/location.service';
import { NoticeService } from 'xforge-common/notice.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { IdentityService } from '../identity.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  it('should submit when email or username is specified', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedIdentityService.forgotPassword(anything())).thenResolve(true);
    env.fixture.detectChanges();

    env.setInputValue(env.userInput, 'user');
    env.clickSubmitButton();

    verify(env.mockedIdentityService.forgotPassword(deepEqual('user'))).once();
    verify(env.mockedNoticeService.show(anyString())).once();
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
    verify(env.mockedNoticeService.show(anyString())).once();
    flush();
    expect().nothing();
  }));

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickSubmitButton();

    verify(env.mockedIdentityService.forgotPassword(anything())).never();
    verify(env.mockedNoticeService.show(anyString())).never();
    expect().nothing();
  }));
});

class TestEnvironment {
  component: ForgotPasswordComponent;
  fixture: ComponentFixture<ForgotPasswordComponent>;

  mockedIdentityService: IdentityService;
  mockedLocationService: LocationService;
  overlayContainer: OverlayContainer;
  mockedNoticeService: NoticeService;

  constructor() {
    this.mockedIdentityService = mock(IdentityService);
    this.mockedLocationService = mock(LocationService);
    this.mockedNoticeService = mock(NoticeService);

    when(this.mockedNoticeService.show(anyString())).thenResolve();

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [ForgotPasswordComponent],
      providers: [
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) },
        { provide: LocationService, useFactory: () => instance(this.mockedLocationService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
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
}
