import { MdcDialog, MdcDialogRef } from '@angular-mdc/web';
import { CommonModule } from '@angular/common';
import { Component, DebugElement, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { NoticeService } from '@xforge-common/notice.service';
import { InviteAction, ProjectService } from '../project.service';
import { UICommonModule } from '../ui-common.module';
import { InviteDialogComponent } from './invite-dialog.component';

// ts lint complains that a directive should be used as an attribute
// tslint:disable-next-line:directive-selector
@Directive({ selector: 'viewContainerDirective' })
class ViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'app-view-container',
  template: '<viewContainerDirective></viewContainerDirective>'
})
class ChildViewContainerComponent {
  // this allows us to open a dialog with access to the fixture containing the dialog
  @ViewChild(ViewContainerDirective) viewContainer: ViewContainerDirective;

  get childViewContainer() {
    return this.viewContainer.viewContainerRef;
  }
}

@NgModule({
  declarations: [ChildViewContainerComponent, InviteDialogComponent, ViewContainerDirective],
  imports: [CommonModule, UICommonModule],
  exports: [ChildViewContainerComponent, InviteDialogComponent, ViewContainerDirective],
  entryComponents: [ChildViewContainerComponent, InviteDialogComponent]
})
class DialogTestModule {}

describe('InviteDialogComponent', () => {
  let dialog: MdcDialog;
  let viewContainerFixture: ComponentFixture<ChildViewContainerComponent>;
  let testViewContainer: ViewContainerRef;
  let mockedNoticeService: NoticeService;
  let mockedProjectService: ProjectService;

  class TestEnvironment {
    fixture: ComponentFixture<ChildViewContainerComponent>;
    component: InviteDialogComponent;
    inviteDialogRef: MdcDialogRef<InviteDialogComponent>;

    constructor() {
      this.inviteDialogRef = dialog.open(InviteDialogComponent, {
        viewContainerRef: testViewContainer
      });
      this.fixture = viewContainerFixture;
      this.component = this.inviteDialogRef.componentInstance;
    }

    get sendInviteButton(): DebugElement {
      return this.fixture.debugElement.query(By.css('#invitation-send-btn'));
    }

    get closeButton(): DebugElement {
      return this.fixture.debugElement.query(By.css('#invitation-close-btn'));
    }

    get emailInput(): DebugElement {
      return this.fixture.debugElement.query(By.css('#email'));
    }

    clickElement(element: DebugElement) {
      element.nativeElement.click();
      this.fixture.detectChanges();
      tick();
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

  beforeEach(() => {
    mockedNoticeService = mock(NoticeService);
    mockedProjectService = mock(ProjectService);
    when(mockedProjectService.onlineInvite(anything())).thenResolve(InviteAction.Invited);
    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      providers: [
        { provide: NoticeService, useFactory: () => instance(mockedNoticeService) },
        { provide: ProjectService, useFactory: () => instance(mockedProjectService) }
      ]
    }).compileComponents();
  });

  beforeEach(inject([MdcDialog], (d: MdcDialog) => {
    dialog = d;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainer = viewContainerFixture.componentInstance.childViewContainer;
  });

  it('form should be invalid when empty and pristine', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();
    expect(env.component.sendInviteForm.pristine).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('email')).toBeFalsy();
    env.clickElement(env.closeButton);
    verify(mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when dirty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    expect(env.component.email.hasError('email')).toBe(false);

    env.clickElement(env.emailInput);
    env.setTextFieldValue(env.emailInput, 'notAnEmailAddress');

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('email')).toBe(true);
    env.clickElement(env.closeButton);
    verify(mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when dirty and empty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.setTextFieldValue(env.emailInput, 'notAnEmailAddress');
    expect(env.component.email.hasError('required')).toBe(false);

    env.clickElement(env.emailInput);
    env.setTextFieldValue(env.emailInput, '');

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('required')).toBe(true);
    env.clickElement(env.closeButton);
    verify(mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when email without .com or .in', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.emailInput);
    env.setTextFieldValue(env.emailInput, 'me@example');
    expect(env.component.email.hasError('required')).toBe(false);

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('pattern')).toBe(true);
    env.clickElement(env.closeButton);
    verify(mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('should submit when form is valid', fakeAsync(() => {
    const emailAddress = 'me@example.com';
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.setTextFieldValue(env.emailInput, emailAddress);

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(true);
    expect(env.component.email.hasError('required')).toBe(false);
    expect(env.component.email.hasError('pattern')).toBe(false);
    expect(env.component.email.hasError('email')).toBe(false);
    env.clickElement(env.sendInviteButton);
    env.clickElement(env.closeButton);
    verify(mockedProjectService.onlineInvite(emailAddress)).once();
    flush();
    const message = 'An invitation email has been sent to ' + emailAddress + '.';
    verify(mockedNoticeService.show(message)).once();
  }));
});
