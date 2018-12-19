import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito';

import { UICommonModule } from '@xforge-common/ui-common.module';
import { UserService } from '@xforge-common/user.service';
import { ParatextService } from '../../core/paratext.service';
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
  let dialog: MatDialog;
  let dialogRef: MatDialogRef<DeleteAccountDialogComponent>;
  let component: DeleteAccountDialogComponent;
  let testViewContainerRef: ViewContainerRef;
  let viewContainerFixture: ComponentFixture<ChildViewContainerComponent>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  const mockedUserService: UserService = mock(UserService);
  const mockedParatextService: ParatextService = mock(ParatextService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [DialogTestModule],
      declarations: [],
      providers: [
        { provide: UserService, useFactory: () => instance(mockedUserService) },
        { provide: ParatextService, useFactory: () => instance(mockedParatextService) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ChildViewContainerComponent);
    viewContainerFixture.detectChanges();
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  beforeEach(inject([MatDialog, OverlayContainer], (d: MatDialog, oc: OverlayContainer) => {
    dialog = d;
    const config = {
      data: {
        name: 'JohnnyByGood',
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
    expect(overlayContainerElement.querySelector('h2').textContent).toContain(heading);
  }));

  it('should have a delete account button', fakeAsync(() => {
    const dialogContainer = overlayContainerElement.querySelector('mat-dialog-container');
    expect(dialogContainer.querySelector('#confirm-delete-button').textContent).toContain(
      'I understand the consequences, delete my account'
    );
  }));

  it('should enable delete button if matching username is entered', fakeAsync(() => {
    const afterCloseCallback = jasmine.createSpy('afterClose callback');
    dialogRef.afterClosed().subscribe(afterCloseCallback);
    const dialogContainer = overlayContainerElement.querySelector('mat-dialog-container');
    const btnDelete: HTMLElement = dialogContainer.querySelector('#confirm-delete-button');
    expect(btnDelete.textContent).toContain('I understand the consequences, delete my account');
    expect(component.data.name).toEqual('JohnnyByGood');
    expect(component.deleteDisabled).toBeTruthy();
    component.userNameEntry.setValue('JohnnyByGood');
    expect(component.deleteDisabled).toBeFalsy();
    btnDelete.click();
    viewContainerFixture.detectChanges();
    tick();
    expect(afterCloseCallback).toHaveBeenCalledTimes(1);
    expect(overlayContainerElement.querySelector('mat-dialog-container')).toBeNull();
    flush();
  }));
});
