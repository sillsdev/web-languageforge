import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { HomeComponent } from './home.component';

class HomeComponentPage {
  constructor(private compFixture: ComponentFixture<HomeComponent>) { }

  get logoutButton() { return this.compFixture.nativeElement.querySelector('#logout'); }
  get titleText() { return this.compFixture.nativeElement.querySelector('h1').textContent; }
}

describe('HomeComponent', () => {
  let loginStatus = true;
  let claims: object;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let page: HomeComponentPage;

  const oauthServiceStub: Partial<OAuthService> = {
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
      imports: [
        RouterTestingModule
      ],
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
    page = new HomeComponentPage(fixture);
    fixture.detectChanges();
  });

  it('should display a title', async(() => {
    expect(page.titleText).toEqual('Hello, world!');
  }));

  it('should logout when the button is clicked', async(() => {
    expect(page.logoutButton.textContent).toContain('Log Out');
    expect(loginStatus).toBe(true);

    page.logoutButton.click();
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
      expect(page.titleText).toEqual('Hello, ' + claims['name'] + '!');
    }));
  });

});
