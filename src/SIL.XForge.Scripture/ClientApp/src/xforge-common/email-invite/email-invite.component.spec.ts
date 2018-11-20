import { OverlayContainer } from '@angular/cdk/overlay';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito';

import { By } from '@angular/platform-browser';
import { AuthService } from '@xforge-common/auth.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { UserService } from '@xforge-common/user.service';
import { EmailInviteComponent } from './email-invite.component';

describe('EmailInviteComponent', () => {

  it('email field should be required', () => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    const errors = env.emailFormControl.errors || {};
    expect(errors['required']).toBe(true);
    expect(errors['email']).toBeFalsy();
  });
/*
  it('form should be invalid when empty and pristine', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickButton(env.inviteButton);

    expect(env.component.sendInviteForm.pristine).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.sendInviteForm.errors).toBe(null);
  }));
*/
  it('form should be invalid when dirty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);
    env.setInputValue(env.emailInput, 'notAnEmailAddress');
    env.clickElement(env.emailInput);
    env.clickElement(env.sendInviteTitle);

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    // expect(env.component.sendInviteForm.errors).toBeTruthy();
  }));
/*
  it('form should be invalid when dirty and empty', fakeAsync(() => {
    const email = component.sendInviteForm.controls['email'];
    email.setValue('', { emitEvent: true });
    fixture.detectChanges();
    tick();
    expect(component.sendInviteForm.dirty).toBe(true);
    expect(component.sendInviteForm.valid).toBe(false);
    expect(component.sendInviteForm.errors).toBeTruthy();
  }));
*/
});

class TestEnvironment {
  component: EmailInviteComponent;
  fixture: ComponentFixture<EmailInviteComponent>;

  mockedAuthService: AuthService;
  mockedUserService: UserService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedAuthService = mock(AuthService);
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        UICommonModule
      ],
      declarations: [EmailInviteComponent],
      providers: [
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ]
    });
    this.fixture = TestBed.createComponent(EmailInviteComponent);
    this.component = this.fixture.componentInstance;
    this.component.ngOnInit();
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get inviteButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#invite-btn'));
  }

  get sendInviteButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-send-btn');
  }

  get cancelButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-cancel-btn');
  }

  get sendInviteTitle(): HTMLElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('.mat-dialog-title');
  }

  get emailInput(): HTMLInputElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#email');
  }

  get emailFormControl(): AbstractControl {
    return this.component.sendInviteForm.controls['email'];
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }

    element.click();
    tick();
    this.fixture.detectChanges();
  }

  setInputValue(input: HTMLInputElement | DebugElement, value: string): void {
    if (input instanceof DebugElement) {
      input = (input as DebugElement).nativeElement as HTMLInputElement;
    }

    input.value = value;
    input.dispatchEvent(new Event('input'));
    tick();
    this.fixture.detectChanges();
  }

}
