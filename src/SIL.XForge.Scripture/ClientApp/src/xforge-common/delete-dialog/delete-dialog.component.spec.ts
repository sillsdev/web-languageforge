import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatToolbarModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { instance, mock } from 'ts-mockito/lib/ts-mockito';

import { UserService } from '@xforge-common/user.service';
import { DeleteDialogComponent } from './delete-dialog.component';

class TestDeleteDialogComponent {
  dialog: MatDialog;
  component: DeleteDialogComponent;
  fixture: ComponentFixture<DeleteDialogComponent>;

  mockedUserService: UserService;

  constructor() {
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatToolbarModule,
        MatDialogModule
      ],
      declarations: [DeleteDialogComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: MAT_DIALOG_DATA },
        { provide: MatDialogRef, useValue: {} }
      ]
    });

    this.fixture = TestBed.createComponent(DeleteDialogComponent);
    this.component = this.fixture.componentInstance;
  }

  get confirmButtonNoStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('#confirm-button-no'));
  }

  get confirmButtonYesStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('#confirm-button-yes'));
  }

  clickButtonNo(): void {
    this.clickButton(this.confirmButtonNoStyle);
  }

  clickButtonYes(): void {
    this.clickButton(this.confirmButtonYesStyle);
  }

  private clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}

describe('DeleteDialogComponent', () => {
  it('Confirm Yes button call', fakeAsync(() => {
    const env = new TestDeleteDialogComponent();
    spyOn(env.component, 'confirmDialog');
    env.fixture.detectChanges();
    env.clickButtonYes();

    env.fixture.whenStable().then(() => {
      expect(env.component.confirmDialog).toHaveBeenCalled();
    });
  }));

  it('Confirm No button call', fakeAsync(() => {
    const env = new TestDeleteDialogComponent();
    spyOn(env.component, 'closeDialog');
    env.fixture.detectChanges();
    env.clickButtonNo();

    env.fixture.whenStable().then(() => {
      expect(env.component.closeDialog).toHaveBeenCalled();
    });
  }));
});
