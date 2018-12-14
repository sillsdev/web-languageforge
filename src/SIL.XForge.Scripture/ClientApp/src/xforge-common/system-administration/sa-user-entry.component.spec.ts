import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { instance, mock } from 'ts-mockito/lib/ts-mockito';

import { UICommonModule } from '../ui-common.module';
import { UserService } from '../user.service';
import { SaUserEntryComponent } from './sa-user-entry.component';

class TestUserEntryComponent {
  component: SaUserEntryComponent;
  fixture: ComponentFixture<SaUserEntryComponent>;
  mockedUserService: UserService;

  constructor() {
    this.mockedUserService = mock(UserService);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, UICommonModule],
      declarations: [SaUserEntryComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [{ provide: UserService, useFactory: () => instance(this.mockedUserService) }]
    });

    this.fixture = TestBed.createComponent(SaUserEntryComponent);
    this.component = this.fixture.componentInstance;
  }

  get addButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.add-button'));
  }

  get updateButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('.update-button'));
  }

  get changePasswordButton(): DebugElement {
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

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }

    element.click();
    this.fixture.detectChanges();
    flush();
  }
}
