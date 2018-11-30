import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { InviteAction, ProjectService } from '../project.service';
import { UICommonModule } from '../ui-common.module';
import { InviteDialogComponent } from './invite-dialog.component';

describe('InviteDialogComponent', () => {
  it('form should be invalid when empty and pristine', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    expect(env.component.sendInviteForm.pristine).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('email')).toBeFalsy();
    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when dirty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    expect(env.component.email.hasError('email')).toBeFalsy();

    env.clickElement(env.emailInput);
    env.setInputValue(env.emailInput, 'notAnEmailAddress');

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('email')).toBe(true);
    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when dirty and empty', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.setInputValue(env.emailInput, 'notAnEmailAddress');
    expect(env.component.email.hasError('required')).toBeFalsy();

    env.clickElement(env.emailInput);
    env.setInputValue(env.emailInput, '');

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('required')).toBe(true);
    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(anything())).never();
    flush();
  }));

  it('form should be invalid when email without .com or .in', fakeAsync(() => {
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.clickElement(env.emailInput);
    env.setInputValue(env.emailInput, 'me@example');
    expect(env.component.email.hasError('required')).toBeFalsy();

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(false);
    expect(env.component.email.hasError('pattern')).toBe(true);
    env.clickElement(env.closeButton);
    verify(env.mockedIdentityService.sendInvite(anything())).never();
  }));

  it('should submit when form is valid', fakeAsync(() => {
    const emailAddress = 'me@example.com';
    const env = new TestEnvironment();
    env.fixture.detectChanges();

    env.setInputValue(env.emailInput, emailAddress);

    expect(env.component.sendInviteForm.dirty).toBe(true);
    expect(env.component.sendInviteForm.valid).toBe(true);
    expect(env.component.email.hasError('required')).toBeFalsy();
    expect(env.component.email.hasError('pattern')).toBe(false);
    expect(env.component.email.hasError('email')).toBeFalsy();
    env.clickElement(env.sendInviteButton);
    env.clickElement(env.closeButton);
    verify(env.mockedProjectService.onlineInvite(emailAddress)).once();
    flush();
  }));
});

class TestEnvironment {
  component: InviteDialogComponent;
  fixture: ComponentFixture<InviteDialogComponent>;

  mockedMatDialogRef: MatDialogRef<InviteDialogComponent>;
  mockedProjectService: ProjectService;

  constructor() {
    this.mockedMatDialogRef = mock(MatDialogRef);
    this.mockedProjectService = mock(ProjectService);

    when(this.mockedProjectService.onlineInvite(anything())).thenResolve(InviteAction.Invited);

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NoopAnimationsModule, UICommonModule],
      declarations: [InviteDialogComponent],
      providers: [
        { provide: MatDialogRef, useFactory: () => instance(this.mockedMatDialogRef) },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) }
      ]
    });
    this.fixture = TestBed.createComponent(InviteDialogComponent);
    this.component = this.fixture.componentInstance;
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
