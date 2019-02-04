import { MdcDialogModule, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { NoticeService } from '../notice.service';
import { InviteAction, ProjectService } from '../project.service';
import { UICommonModule } from '../ui-common.module';
import { EmailInviteComponent } from './email-invite.component';
import { InviteDialogComponent } from './invite-dialog.component';

describe('EmailInviteComponent', () => {
  it('form should be invalid when empty and pristine', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);

    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(anything())).never();
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
    verify(env.mockedProjectService.onlineInvite(anything())).never();
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
    verify(env.mockedProjectService.onlineInvite(anything())).never();
    expect().nothing();
    flush();
  }));

  it('should submit when form is valid', fakeAsync(() => {
    const emailAddress = 'me@example.com';
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.inviteButton);
    env.setInputValue(env.emailInput, emailAddress);
    expect(env.emailInput.querySelector('input').value).toBe(emailAddress);
    env.clickElement(env.sendInviteButton);

    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(anything())).once();
    expect().nothing();
    flush();
  }));
});

@NgModule({
  imports: [FormsModule, MdcDialogModule, ReactiveFormsModule, NoopAnimationsModule, UICommonModule],
  exports: [InviteDialogComponent],
  declarations: [InviteDialogComponent],
  entryComponents: [InviteDialogComponent]
})
class DialogTestModule {}

class TestEnvironment {
  component: EmailInviteComponent;
  fixture: ComponentFixture<EmailInviteComponent>;

  mockedMdcDialogRef: MdcDialogRef<InviteDialogComponent>;
  mockedProjectService: ProjectService;
  mockedNoticeService: NoticeService;
  overlayContainer: OverlayContainer;

  constructor() {
    this.mockedMdcDialogRef = mock(MdcDialogRef);
    this.mockedProjectService = mock(ProjectService);
    this.mockedNoticeService = mock(NoticeService);

    when(this.mockedProjectService.onlineInvite(anything())).thenResolve(InviteAction.Invited);
    when(this.mockedNoticeService.show(anything())).thenResolve();

    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [EmailInviteComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MdcDialogRef, useFactory: () => instance(this.mockedMdcDialogRef) },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ]
    });
    this.fixture = TestBed.createComponent(EmailInviteComponent);
    this.component = this.fixture.componentInstance;
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get inviteButton(): HTMLButtonElement {
    return this.fixture.nativeElement.querySelector('#invite-btn');
  }

  get sendInviteButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-send-btn');
  }

  get closeButton(): HTMLButtonElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#invitation-close-btn');
  }

  get emailInput(): HTMLElement {
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    return overlayContainerElement.querySelector('#email');
  }

  clickElement(element: HTMLElement): void {
    element.click();
    flush();
    this.fixture.detectChanges();
  }

  setInputValue(textField: HTMLElement, value: string): void {
    const inputElem: HTMLInputElement = textField.querySelector('input');
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }
}
