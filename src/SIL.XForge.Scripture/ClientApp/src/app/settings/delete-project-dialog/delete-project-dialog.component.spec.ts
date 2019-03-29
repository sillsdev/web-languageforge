import { MdcDialog, MdcDialogConfig, MdcDialogRef, OverlayContainer } from '@angular-mdc/web';
import { Component, Directive, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';

import { AuthService } from 'xforge-common/auth.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { DeleteProjectDialogComponent } from './delete-project-dialog.component';

describe('DeleteProjectDialogComponent', () => {
  let dialog: MdcDialog;
  let overlayContainer: OverlayContainer;
  let viewContainerFixture: ComponentFixture<ChildViewContainerComponent>;
  let testViewContainerRef: ViewContainerRef;

  it('should allow user to delete the project', fakeAsync(() => {
    const env = new TestEnvironment();
    // Project name matching is case insensitive
    env.inputValue(env.projectInput, 'PrOjEcT01');
    expect(env.component.deleteDisabled).toBe(false);
    env.clickElement(env.deleteButton);
    flush();
    expect(env.afterCloseCallback).toHaveBeenCalledWith('accept');
  }));

  it('should not delete the project if project name does not match', fakeAsync(() => {
    const env = new TestEnvironment();
    env.inputValue(env.projectInput, 'project02');
    expect(env.component.deleteDisabled).toBe(true);
    env.clickElement(env.deleteButton);
    flush();
    expect(env.afterCloseCallback).toHaveBeenCalledTimes(0);
  }));

  it('should allow user to cancel', fakeAsync(() => {
    const env = new TestEnvironment();
    env.clickElement(env.cancelButton);
    flush();
    expect(env.afterCloseCallback).toHaveBeenCalledWith('cancel');
  }));

  class TestEnvironment {
    fixture: ComponentFixture<ChildViewContainerComponent>;
    component: DeleteProjectDialogComponent;
    dialogRef: MdcDialogRef<DeleteProjectDialogComponent>;
    overlayContainerElement: HTMLElement;

    afterCloseCallback: jasmine.Spy;

    constructor() {
      this.afterCloseCallback = jasmine.createSpy('afterClose callback');
      const config: MdcDialogConfig = { data: { name: 'project01' }, viewContainerRef: testViewContainerRef };
      this.dialogRef = dialog.open(DeleteProjectDialogComponent, config);
      this.dialogRef.afterClosed().subscribe(this.afterCloseCallback);
      this.component = this.dialogRef.componentInstance;
      this.overlayContainerElement = overlayContainer.getContainerElement();
      this.fixture = viewContainerFixture;
      this.fixture.detectChanges();
    }

    get deleteButton(): HTMLElement {
      return this.overlayContainerElement.querySelector('#project-delete-btn');
    }

    get cancelButton(): HTMLElement {
      return this.overlayContainerElement.querySelector('#cancel-btn');
    }

    get projectInput(): HTMLElement {
      return this.overlayContainerElement.querySelector('#project-entry');
    }

    inputValue(element: HTMLElement, value: string) {
      const inputElem = element.querySelector('input') as HTMLInputElement;
      inputElem.value = value;
      inputElem.dispatchEvent(new Event('input'));
      this.fixture.detectChanges();
      tick();
    }

    clickElement(element: HTMLElement) {
      element.click();
      this.fixture.detectChanges();
      tick();
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogTestModule, UICommonModule],
      providers: [AuthService]
    });
  });

  beforeEach(inject([MdcDialog, OverlayContainer], (d: MdcDialog, oc: OverlayContainer) => {
    dialog = d;
    overlayContainer = oc;
  }));

  beforeEach(() => {
    viewContainerFixture = TestBed.createComponent(ChildViewContainerComponent);
    testViewContainerRef = viewContainerFixture.componentInstance.childViewContainer;
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
});

@Directive({
  // ts lint complains that a directive should be used as an attribute
  // tslint:disable-next-line:directive-selector
  selector: 'viewContainerDirective'
})
class ViewContainerDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
  selector: 'app-view-container',
  template: '<viewContainerDirective></viewContainerDirective>'
})
class ChildViewContainerComponent {
  @ViewChild(ViewContainerDirective) viewContainer: ViewContainerDirective;

  get childViewContainer(): ViewContainerRef {
    return this.viewContainer.viewContainerRef;
  }
}

@NgModule({
  imports: [UICommonModule],
  declarations: [ViewContainerDirective, ChildViewContainerComponent, DeleteProjectDialogComponent],
  exports: [ViewContainerDirective, ChildViewContainerComponent, DeleteProjectDialogComponent],
  entryComponents: [ChildViewContainerComponent, DeleteProjectDialogComponent]
})
class DialogTestModule {}
