import { MdcDialog, MdcDialogRef } from '@angular-mdc/web';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
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
  const DeleteButtonText = 'I understand the consequences; delete my account';
  const UserName = 'JohnnyBGoode';

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
        name: UserName,
        viewContainerRef: testViewContainerRef
      }
    };
    dialogRef = dialog.open(DeleteAccountDialogComponent, config);
    component = dialogRef.componentInstance;
    overlayContainer = oc;
    // TODO (Hasso) 2019.03: before, some magic populated the container element. Now, an empty one is created.
    // TODO: find a more efficient way of finding the elements needed by tests.
    overlayContainerElement = oc.getContainerElement().parentElement;
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
    expect(dialogContainer.querySelector('#confirm-delete-button').textContent).toContain(DeleteButtonText);
  }));

  it('should enable delete button if matching username is entered', fakeAsync(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    dialogRef.afterClosed().subscribe(afterCloseCallback);
    const dialogContainer = overlayContainer.getContainerElement().parentElement.querySelector('mdc-dialog-container');
    const btnDelete: HTMLElement = dialogContainer.querySelector('#confirm-delete-button');
    expect(btnDelete.textContent).toContain(DeleteButtonText);
    expect(component.data.name).toEqual(UserName);
    expect(component.deleteDisabled).toBe(true);
    component.userNameEntry.setValue(UserName);
    viewContainerFixture.detectChanges();
    flush();
    expect(component.deleteDisabled).toBe(false);
    btnDelete.click();
    viewContainerFixture.detectChanges();
    flush();
    expect(afterCloseCallback).toHaveBeenCalledTimes(1);
    expect(overlayContainer.getContainerElement().parentElement.querySelector('mdc-dialog-container')).toBeNull();
    flush();
  }));
});
