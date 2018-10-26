import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatTableModule } from '@angular/material';
import { By } from '@angular/platform-browser';
import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { mock } from 'ts-mockito';
import { SystemAdministrationComponent } from './system-administration.component';

class TestEnvironment {

  component: SystemAdministrationComponent;
  fixture: ComponentFixture<SystemAdministrationComponent>;

  mockedUserService: UserService;
  mockedNoticeService: NoticeService;


  constructor() {
    this.mockedUserService = mock(UserService);
    this.mockedNoticeService = mock(NoticeService);

    TestBed.configureTestingModule({
      declarations: [SystemAdministrationComponent],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule, MatTableModule, MatDialogModule],
      providers: [DatePipe, OAuthService, UrlHelperService, UserService, JSONAPIService]
    });

    this.fixture = TestBed.createComponent(SystemAdministrationComponent);
    this.component = this.fixture.componentInstance;

  }

  get buttonStyle(): DebugElement {
    return this.fixture.debugElement.query(By.css('.button'));
  }

  clickSubmitButton(): void {
    this.clickButton(this.buttonStyle);
  }

  private clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

}
