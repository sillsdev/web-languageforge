import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {OAuthService} from 'angular-oauth2-oidc';

import {HomeComponent} from './home.component';

describe('HomeComponent', () => {
  const oauthMockService = {
    getIdentityClaims() {},
    initImplicitFlow() {},
    logOut() {
      loginStatus = false;
    }
  };

  let loginStatus = true;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      providers: [
        { provide: OAuthService, useFactory: () => oauthMockService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display a title', async(() => {
    const titleText = fixture.nativeElement.querySelector('h1').textContent;
    expect(titleText).toEqual('Hello, world!');
  }));

  it('should logout when the button is clicked', async(() => {
    const logoutButton = fixture.nativeElement.querySelector('button');
    expect(logoutButton.textContent).toContain('Logout');
    expect(loginStatus).toBe(true);

    logoutButton.click();
    fixture.detectChanges();
    expect(loginStatus).toBe(false);
  }));

});
