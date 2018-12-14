import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { instance, mock } from 'ts-mockito/lib/ts-mockito';

import { UserService } from '../user.service';
import { SaDeleteDialogComponent } from './sa-delete-dialog.component';

class TestDeleteDialogComponent {
  dialog: MatDialog;
  component: SaDeleteDialogComponent;
  fixture: ComponentFixture<SaDeleteDialogComponent>;

  mockedUserService: UserService;

  constructor() {
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, UICommonModule],
      declarations: [SaDeleteDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: MAT_DIALOG_DATA },
        { provide: MatDialogRef, useValue: {} }
      ]
    });

    this.fixture = TestBed.createComponent(SaDeleteDialogComponent);
    this.component = this.fixture.componentInstance;
  }

  get noButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#confirm-button-no'));
  }

  get yesButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#confirm-button-yes'));
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }

    element.click();
    this.fixture.detectChanges();
    flush();
  }
}

describe('DeleteDialogComponent', () => {
  it('Confirm Yes button call', fakeAsync(() => {
    const env = new TestDeleteDialogComponent();
    spyOn(env.component, 'confirmDialog');
    env.clickElement(env.yesButton);

    expect(env.component.confirmDialog).toHaveBeenCalled();
  }));

  it('Confirm No button call', fakeAsync(() => {
    const env = new TestDeleteDialogComponent();
    spyOn(env.component, 'closeDialog');
    env.clickElement(env.noButton);

    expect(env.component.closeDialog).toHaveBeenCalled();
  }));
});
