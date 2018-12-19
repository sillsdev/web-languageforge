import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, mock } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

describe('AppComponent', () => {
  const mockedAuthService = mock(AuthService);

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavMenuComponent, HomeComponent, FetchDataComponent],
      imports: [
        CoreModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'home', component: HomeComponent },
          { path: 'fetch-data', component: FetchDataComponent }
        ]),
        UICommonModule,
        XForgeCommonModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: AuthService, useFactory: () => instance(mockedAuthService) }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should have as title "Scripture Forge"', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Scripture Forge');
  }));
});
