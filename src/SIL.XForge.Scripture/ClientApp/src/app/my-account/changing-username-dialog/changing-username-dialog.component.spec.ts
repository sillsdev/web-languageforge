import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { UICommonModule } from '@xforge-common/ui-common.module';
import { ChangingUsernameDialogComponent } from './changing-username-dialog.component';

class TestEnvironment {
  component: ChangingUsernameDialogComponent;
  fixture: ComponentFixture<ChangingUsernameDialogComponent>;

  constructor() {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, HttpClientTestingModule, NoopAnimationsModule, UICommonModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: jasmine.createSpy('close')
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      declarations: [ChangingUsernameDialogComponent]
    }).compileComponents();

    this.fixture = TestBed.createComponent(ChangingUsernameDialogComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  get cancelButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.cancel-button'));
  }

  get updateButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.update-button'));
  }

  public clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}

describe('ChangingUsernameDialogComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should close dialog on cancel', fakeAsync(() => {
    env.clickButton(env.cancelButton);
    expect(env.component.dialogRef.close).toHaveBeenCalled();
  }));

  it('should close dialog on update', fakeAsync(() => {
    env.clickButton(env.updateButton);
    expect(env.component.dialogRef.close).toHaveBeenCalled();
    expect(env.component.dialogRef.close).toHaveBeenCalledWith('update');
  }));

  it('should display correct old and new values', fakeAsync(() => {
    env.component.data = { oldUsername: 'oldUsername', newUsername: 'newUsername' };
    flush();
    env.fixture.detectChanges();
    expect(env.fixture.debugElement.nativeElement.querySelector('mat-dialog-content').textContent).toContain(
      'oldUsername'
    );
    expect(env.fixture.debugElement.nativeElement.querySelector('mat-dialog-content').textContent).toContain(
      'newUsername'
    );
  }));

  it('should report request to update', fakeAsync(() => {
    env.clickButton(env.updateButton);
    expect(env.component.dialogRef.close).toHaveBeenCalledWith('update');
  }));

  it('should report cancel', fakeAsync(() => {
    env.clickButton(env.cancelButton);
    expect(env.component.dialogRef.close).toHaveBeenCalledWith('cancel');
  }));
});
