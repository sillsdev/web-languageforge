import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {OAuthService} from 'angular-oauth2-oidc';

import {HomeComponent} from './home.component';

describe('HomeComponent', () => {
  let loginStatus = true;
  let claims: object;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const oauthServiceStub = {
    getIdentityClaims() {
      return claims;
    },
    initImplicitFlow() {},
    logOut() {
      loginStatus = false;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      providers: [
        { provide: OAuthService, useValue: oauthServiceStub }
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

  describe('with Name in context', () => {
    beforeAll(() => {
      claims = {
        name: 'JohnyBeGood'
      };
    });

    it('should display a user identified title', async(() => {
      const titleText = fixture.nativeElement.querySelector('h1').textContent;
      expect(titleText).toEqual('Hello, ' + claims['name'] + '!');
    }));
  });

});
