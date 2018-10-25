import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { EMPTY } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

describe('AppComponent', () => {
  const mockedOAuthService = mock(OAuthService);
  const mockedJSONAPIService = mock(JSONAPIService);
  when(mockedOAuthService.events).thenReturn(EMPTY);

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        CounterComponent,
        FetchDataComponent
      ],
      imports: [
        CoreModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'home', component: HomeComponent },
          { path: 'counter', component: CounterComponent },
          { path: 'fetch-data', component: FetchDataComponent },
        ]),
        XForgeCommonModule
      ],
      providers: [
        { provide: OAuthService, useFactory: () => instance(mockedOAuthService) },
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should have as title \'Scripture Forge\'', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Scripture Forge');
  }));

});
