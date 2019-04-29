import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DebugElement, ViewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';
import { MapQueryResults } from 'xforge-common/json-api.service';
import { DomainModel } from 'xforge-common/models/domain-model';
import { User } from 'xforge-common/models/user';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { CheckingOwnerComponent } from './checking-owner.component';

describe('CheckingOwnerComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
  });

  it('should create', () => {
    const template = '<app-checking-owner ownerRef="user01"></app-checking-owner>';
    env.createHostComponent(template);
    expect(env.fixture.componentInstance).toBeTruthy();
  });

  it('displays owner name', () => {
    const template = '<app-checking-owner ownerRef="user01"></app-checking-owner>';
    env.createHostComponent(template);
    expect(env.userName).toBe('User 01');
  });

  it('displays avatar', () => {
    const template =
      '<app-checking-owner #checkingOwner ownerRef="user01" [includeAvatar]="true"></app-checking-owner>';
    env.createHostComponent(template);
    expect(env.avatar).toBeTruthy();
    expect(env.avatar.query(By.css('app-avatar'))).toBeTruthy();
    env.fixture.componentInstance.checkingOwner.includeAvatar = false;
    env.fixture.detectChanges();
    expect(env.avatar).toBeFalsy();
  });

  it('displays date/time ', () => {
    const template = '<app-checking-owner #checkingOwner ownerRef="user01"></app-checking-owner>';
    env.createHostComponent(template);
    env.fixture.componentInstance.checkingOwner.dateTime = null;
    env.fixture.detectChanges();
    expect(env.fixture.debugElement.query(By.css('.layout .date-time'))).toBe(null);
    env.fixture.componentInstance.checkingOwner.dateTime = new Date(2019, 3, 25, 12, 30, 0);
    env.fixture.detectChanges();
    expect(env.dateTime).toBe(' 25 Apr 19 at 12:30PM');
  });

  it('layout set correctly', () => {
    const template =
      '<app-checking-owner #checkingOwner ownerRef="user01" [layoutStacked]="true"></app-checking-owner>';
    env.createHostComponent(template);
    expect(env.layout.classes['layout-stacked']).toBeTruthy();
    expect(env.layout.classes['layout-inline']).toBeFalsy();
    env.fixture.componentInstance.checkingOwner.layoutStacked = false;
    env.fixture.detectChanges();
    expect(env.layout.classes['layout-stacked']).toBeFalsy();
    expect(env.layout.classes['layout-inline']).toBeTruthy();
  });
});

@Component({ selector: 'app-host', template: '' })
class HostComponent {
  @ViewChild(CheckingOwnerComponent) checkingOwner: CheckingOwnerComponent;
}

class TestEnvironment {
  component: CheckingOwnerComponent;
  fixture: ComponentFixture<HostComponent>;

  mockedRouter: Router;
  mockedDomainModel: DomainModel;
  mockedOAuthService: OAuthService;
  mockedUserService: UserService;
  testUser = new User({
    id: 'user01',
    email: 'user01@example.com',
    name: 'User 01',
    password: 'password01',
    role: 'user',
    active: true,
    dateCreated: '2019-01-01T12:00:00.000Z'
  });

  constructor() {
    this.mockedRouter = mock(Router);
    this.mockedDomainModel = mock(DomainModel);
    this.mockedOAuthService = mock(OAuthService);
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      declarations: [HostComponent, CheckingOwnerComponent],
      imports: [UICommonModule, XForgeCommonModule],
      providers: [
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: DomainModel, useFactory: () => instance(this.mockedDomainModel) },
        { provide: OAuthService, useFactory: () => instance(this.mockedOAuthService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ]
    });

    when(this.mockedUserService.onlineGet('user01')).thenReturn(of(new MapQueryResults(this.testUser)));
  }

  createHostComponent(template: string): void {
    TestBed.overrideComponent(HostComponent, { set: { template: template } });
    this.fixture = TestBed.createComponent(HostComponent);
    this.fixture.detectChanges();
  }

  get userName(): string {
    return this.fixture.debugElement.query(By.css('.layout .name')).nativeElement.textContent;
  }

  get dateTime(): string {
    return this.fixture.debugElement.query(By.css('.layout .date-time')).nativeElement.textContent;
  }

  get layout(): DebugElement {
    return this.fixture.debugElement.query(By.css('.layout'));
  }

  get avatar(): DebugElement {
    return this.fixture.debugElement.query(By.css('.avatar'));
  }
}
