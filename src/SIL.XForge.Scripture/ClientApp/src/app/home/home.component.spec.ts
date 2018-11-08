import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, mock, when } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { HomeComponent } from './home.component';

class HomeComponentPage {
  constructor(private compFixture: ComponentFixture<HomeComponent>) { }

  get logoutButton() { return this.compFixture.nativeElement.querySelector('#logout'); }
  get titleText() { return this.compFixture.nativeElement.querySelector('h1').textContent; }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let page: HomeComponentPage;
  const mockedAuthService = mock(AuthService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ HomeComponent ],
      providers: [
        { provide: AuthService, useFactory: () => instance(mockedAuthService) }
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
});
