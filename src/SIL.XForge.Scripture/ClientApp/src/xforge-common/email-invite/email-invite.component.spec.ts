import { OverlayContainer } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { IdentityService } from '@identity/identity.service';
import { SendInviteResult } from '@identity/models/send-invite-result';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { EmailInviteComponent } from './email-invite.component';
import { InviteDialogComponent } from './invite-dialog.component';

describe('EmailInviteComponent', () => {
  it('form should be invalid when empty and pristine', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);

    env.clickElement(env.closeButton);
    verify(env.mockedIdentityService.sendInvite(anything())).never();
    expect().nothing();
    flush();
  }));

  it('form should be invalid when dirty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);

    env.clickElement(env.emailInput);
    env.setInputValue(env.emailInput, 'notAnEmailAddress');

    env.clickElement(env.closeButton);
    verify(env.mockedIdentityService.sendInvite(anything())).never();
    expect().nothing();
    flush();
  }));

  it('form should be invalid when dirty and empty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);
    env.setInputValue(env.emailInput, 'notAnEmailAddress');

    env.clickElement(env.emailInput);
    env.setInputValue(env.emailInput, '');

    env.clickElement(env.closeButton);
    verify(env.mockedIdentityService.sendInvite(anything())).never();
    expect().nothing();
    flush();
  }));

  it('should submit when form is valid', fakeAsync(() => {
    const emailAddress = 'me@example.com';
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);
    env.setInputValue(env.emailInput, emailAddress);

    env.clickElement(env.sendInviteButton);
    verify(env.mockedIdentityService.sendInvite(emailAddress)).once();
    expect().nothing();
    flush();
  }));
});

@NgModule({
  imports: [FormsModule, MatDialogModule, ReactiveFormsModule, NoopAnimationsModule, UICommonModule],
  exports: [InviteDialogComponent],
  declarations: [InviteDialogComponent],
  entryComponents: [InviteDialogComponent]
})
class DialogTestModule {}

class TestEnvironment {
  component: EmailInviteComponent;
  fixture: ComponentFixture<EmailInviteComponent>;

  mockedMatDialogRef: MatDialogRef<InviteDialogComponent>;
  mockedIdentityService: IdentityService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedMatDialogRef = mock(MatDialogRef);
    this.mockedIdentityService = mock(IdentityService);

    const sendInviteResult = {
      success: true
    } as SendInviteResult;
    when(this.mockedIdentityService.sendInvite(anything())).thenResolve(sendInviteResult);

    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [EmailInviteComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useFactory: () => instance(this.mockedMatDialogRef) },
        { provide: IdentityService, useFactory: () => instance(this.mockedIdentityService) }
      ]
    });
    this.fixture = TestBed.createComponent(EmailInviteComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get inviteButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#invite-btn'));
  }

  get sendInviteButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-send-btn');
  }

  get closeButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-close-btn');
  }

  get emailInput(): HTMLInputElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#email');
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
