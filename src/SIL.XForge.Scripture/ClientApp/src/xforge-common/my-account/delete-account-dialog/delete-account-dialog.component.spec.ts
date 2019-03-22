import { MdcDialog, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito';

import { UICommonModule } from '../../ui-common.module';
import { UserService } from '../../user.service';
import { DeleteAccountDialogComponent } from './delete-account-dialog.component';

// ts lint complains that a directive should be used as an attribute
// tslint:disable-next-line:directive-selector
@Directive({ selector: 'viewContainerDirective' })
class ViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'app-container',
  template: '<viewContainerDirective></viewContainerDirective>'
})
class ChildViewContainerComponent {
  // This allows us to open a dialog with access to the fixture containing the dialog
  @ViewChild(ViewContainerDirective) childWithViewContainer: ViewContainerDirective;

  get childViewContainer() {
    return this.childWithViewContainer.viewContainerRef;
  }
}

@NgModule({
  declarations: [DeleteAccountDialogComponent, ChildViewContainerComponent, ViewContainerDirective],
  imports: [FormsModule, NoopAnimationsModule, ReactiveFormsModule, UICommonModule],
  exports: [DeleteAccountDialogComponent, ChildViewContainerComponent, ViewContainerDirective],
  providers: [],
  entryComponents: [DeleteAccountDialogComponent]
})
class DialogTestModule {}

describe('DeleteAccountDialogComponent', () => {
  // The first phrase on the delete button is in a span that disappears when the screen is too narrow.
  // The MdcDialogButton trims whitespace around HTML tags, so the space between must be &nbsp;
  const DELETE_BUTTON_TEXT = 'I understand the consequences;\xA0delete my account';
  const USER_NAME = 'JohnnyBGoode';

  let dialog: MdcDialog;
  let dialogRef: MdcDialogRef<DeleteAccountDialogComponent>;
  let component: DeleteAccountDialogComponent;
  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ChildViewContainerComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const mockedUserService: UserService = mock(UserService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [],
      providers: [{ provide: UserService, useFactory: () => instance(mockedUserService) }]
    }).compileComponents();
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  beforeEach(inject([MdcDialog, OverlayContainer], (d: MdcDialog, oc: OverlayContainer) => {
    dialog = d;
    const config = {
      data: {
        name: USER_NAME,
        viewContainerRef: testViewContainerRef
      }
    };
    dialogRef = dialog.open(DeleteAccountDialogComponent, config);
    component = dialogRef.componentInstance;
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it('should show a dialog', fakeAsync(() => {
    const heading = 'Are you sure you want to delete your account?';
    expect(overlayContainerElement.querySelector('mdc-dialog-title').textContent).toContain(heading);
  }));

  it('should have a delete account button', fakeAsync(() => {
    const dialogContainer = overlayContainerElement.querySelector('mdc-dialog-container');
    expect(dialogContainer.querySelector('#confirm-delete-button').textContent).toContain(DELETE_BUTTON_TEXT);
  }));

  it('should enable delete button if matching username is entered', fakeAsync(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    dialogRef.afterClosed().subscribe(afterCloseCallback);
    const dialogContainer = overlayContainerElement.querySelector('mdc-dialog-container');
    const btnDelete: HTMLElement = dialogContainer.querySelector('#confirm-delete-button');
    expect(btnDelete.textContent).toContain(DELETE_BUTTON_TEXT);
    expect(component.data.name).toEqual(USER_NAME);
    expect(component.deleteDisabled).toBe(true);
    component.userNameEntry.setValue(USER_NAME);
    viewContainerFixture.detectChanges();
    expect(component.userNameEntry.value).toEqual(USER_NAME);
    expect(component.deleteDisabled).toBe(false);
    btnDelete.click();
    flush();
    viewContainerFixture.detectChanges();
    expect(afterCloseCallback).toHaveBeenCalledTimes(1);
    expect(overlayContainerElement.querySelector('mdc-dialog-container')).toBeNull();
    flush();
  }));
});
