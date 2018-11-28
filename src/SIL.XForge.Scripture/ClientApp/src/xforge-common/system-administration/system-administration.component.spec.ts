import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatOptionModule,
  MatPaginatorModule,
  MatTableModule
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { AvatarModule } from 'ngx-avatar';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { NoticeService } from '@xforge-common/notice.service';
import { UserService } from '@xforge-common/user.service';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { SFUserService } from '../../app/core/sfuser.service';
import { SystemAdministrationComponent } from './system-administration.component';

class UserTestEnvironment {
  component: SystemAdministrationComponent;
  fixture: ComponentFixture<SystemAdministrationComponent>;

  mockedUserService: UserService;
  mockedNoticeService: NoticeService;
  mockedSFUserService: SFUserService;
  mockedJsonApiService: JSONAPIService;

  constructor() {
    this.mockedUserService = mock(UserService);
    this.mockedNoticeService = mock(NoticeService);
    this.mockedSFUserService = mock(SFUserService);
    this.mockedJsonApiService = mock(JSONAPIService);

    when(this.mockedSFUserService.getAllUserProjects()).thenReturn(of({}));
    when(this.mockedSFUserService.onlineAddUser(anything())).thenResolve('projectuser01');
    when(this.mockedSFUserService.currentUserId).thenReturn('user01');

    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatOptionModule,
        MatTableModule,
        MatDialogModule,
        MatPaginatorModule,
        MatButtonModule,
        AvatarModule,
        XForgeCommonModule
      ],
      declarations: [SystemAdministrationComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: SFUserService, useFactory: () => instance(this.mockedSFUserService) },
        { provide: JSONAPIService, useFactory: () => instance(this.mockedJsonApiService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        DatePipe,
        OAuthService,
        UrlHelperService
      ]
    });
    this.fixture = TestBed.createComponent(SystemAdministrationComponent);
    this.component = this.fixture.componentInstance;
  }

  get addUserButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#btnAddUser'));
  }

  clickAddLayoutButton(): void {
    this.clickButton(this.addUserButton);
  }

  private clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }
}

describe('SystemAdministrationComponent', () => {
  const response: any[] = [
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd97',
        username: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd98',
        username: 'testuser1',
        name: 'testuser1',
        email: 'testuser1@example.com',
        role: 'system_user',
        active: false,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser2',
        name: 'testuser2',
        email: 'testuser2@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser3',
        name: 'testuser3',
        email: 'testuser3@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser4',
        name: 'testuser4',
        email: 'testuser4@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser5',
        name: 'testuser5',
        email: 'testuser5@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser6',
        name: 'testuser6',
        email: 'testuser6@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser7',
        name: 'testuser7',
        email: 'testuser7@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser8',
        name: 'testuser8',
        email: 'testuser8@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser9',
        name: 'testuser9',
        email: 'testuser9@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser10',
        name: 'testuser10',
        email: 'testuser10@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser11',
        name: 'testuser11',
        email: 'testuser11@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser12',
        name: 'testuser12',
        email: 'testuser12@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser13',
        name: 'testuser13',
        email: 'testuser13@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser14',
        name: 'testuser14',
        email: 'testuser14@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser15',
        name: 'testuser15',
        email: 'testuser15@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser16',
        name: 'testuser16',
        email: 'testuser16@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser17',
        name: 'testuser17',
        email: 'testuser17@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser18',
        name: 'testuser18',
        email: 'testuser18@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser19',
        name: 'testuser19',
        email: 'testuser19@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    },
    {
      user: {
        type: 'user',
        id: '5be566bab27b13e12bbcdd99',
        username: 'testuser20',
        name: 'testuser20',
        email: 'testuser20@example.com',
        role: 'system_admin',
        active: true,
        dateModified: '2018-11-12T07:20:33.893Z',
        dateCreated: '0001-01-01T00:00:00',
        projects: []
      }
    }
  ];

  it('show the records in the view state', fakeAsync(() => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    expect(env.component.dataSource.data).toEqual(response);
    flush();
  }));

  it('search field and Show the records in the view state', fakeAsync(() => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    env.component.applyFilter('test');
    expect(env.component.dataSource.filteredData.length).toEqual(20);
    flush();
  }));

  it('click the add user button and show the add edit layout component in the view state', fakeAsync(() => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    expect(env.component.addEditPanel).toBeFalsy();

    env.clickAddLayoutButton();

    expect(env.component.addEditPanel).toBeTruthy();
    flush();
  }));

  it('search and filter the records equals with usercount in the view state', fakeAsync(() => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    env.component.applyFilter('testuser2');

    expect(env.component.dataSource.filteredData.length).toEqual(env.component.userCount);
    flush();
  }));

  it('pagination hidden less than 20 records to show the control in the view state', fakeAsync(() => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    expect(env.component.enablePagination).toBeTruthy();

    env.component.applyFilter('testuser2');

    expect(env.component.enablePagination).toBeFalsy();
    flush();
  }));

  it('pagination display more than 20 records to show the control in the view state', () => {
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(response));
    env.fixture.detectChanges();

    expect(env.component.enablePagination).toBeTruthy();
  });

  it('show the cancel invite button and remove user button based on condition in the view state', () => {
    const result: any[] = [
      {
        user: {
          type: 'user',
          id: '5be566bab27b13e12bbcdd97',
          username: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'system_admin',
          active: true,
          dateModified: '2018-11-12T07:20:33.893Z',
          dateCreated: '0001-01-01T00:00:00',
          projects: []
        }
      },
      {
        user: {
          type: 'user',
          id: '5be566bab27b13e12bbcdd98',
          username: 'testuser1',
          name: 'testuser1',
          email: 'testuser1@example.com',
          role: 'system_user',
          active: false,
          dateModified: '2018-11-12T07:20:33.893Z',
          dateCreated: '0001-01-01T00:00:00',
          projects: []
        }
      },
      {
        user: {
          type: 'user',
          id: '5be566bab27b13e12bbcdd99',
          username: 'testuser2',
          name: 'testuser2',
          email: 'testuser2@example.com',
          role: 'system_admin',
          active: false,
          dateModified: '2018-11-12T07:20:33.893Z',
          dateCreated: '0001-01-01T00:00:00',
          projects: []
        }
      }
    ];
    const env = new UserTestEnvironment();
    when(env.mockedSFUserService.getAllUserProjects()).thenReturn(of(result));
    env.fixture.detectChanges();

    const cancelInviteButton = env.fixture.debugElement.nativeElement.querySelectorAll('.cancel-invite');

    expect(cancelInviteButton[0].textContent).toEqual('Cancel Invite');
    expect(cancelInviteButton[1].textContent).toEqual('Cancel Invite');
    expect(cancelInviteButton.length).toEqual(2);

    const removeUserButton = env.fixture.debugElement.nativeElement.querySelectorAll('.remove-user');

    expect(removeUserButton[0].innerText).toEqual('clear');
    expect(removeUserButton.length).toEqual(1);
  });
});
