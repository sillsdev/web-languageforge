import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatToolbarModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { instance, mock } from 'ts-mockito/lib/ts-mockito';

import { UserService } from '@xforge-common/user.service';
import { UserEntryComponent } from './user-entry.component';

class TestUserEntryComponent {
  component: UserEntryComponent;
  fixture: ComponentFixture<UserEntryComponent>;
  mockedUserService: UserService;

  constructor() {
    this.mockedUserService = mock(UserService);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatOptionModule,
        MatToolbarModule,
        MatSelectModule,
        MatSlideToggleModule,
        NoopAnimationsModule,
        PasswordStrengthMeterModule
      ],
      declarations: [UserEntryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{ provide: UserService, useFactory: () => instance(this.mockedUserService) }]
    });

    this.fixture = TestBed.createComponent(UserEntryComponent);
    this.component = this.fixture.componentInstance;
  }

  get addButtonStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('.add-button'));
  }

  get updateButtonStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('.update-button'));
  }

  get changepasswordButtonStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('.changepassword-button'));
  }

  get accountUserFormDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('div[formGroupName="accountUserForm"'));
  }

  get userRoleSelect(): DebugElement {
    return this.accountUserFormDiv.query(By.css('mat-select[formControlName="Role"]'));
  }

  changeSelectValue(select: DebugElement, option: number): void {
    select.nativeElement.click();
    this.fixture.detectChanges();
    flush();
    const options = select.queryAll(By.css('mat-option'));
    options[option].nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  clickUserAddButton(): void {
    this.clickButton(this.addButtonStyle);
  }

  private clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}
