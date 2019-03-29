import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { instance, mock } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { NavMenuComponent } from './nav-menu/nav-menu.component';

describe('AppComponent', () => {
  const mockedAuthService = mock(AuthService);

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, NavMenuComponent],
      imports: [CoreModule, HttpClientTestingModule, UICommonModule, XForgeCommonModule, RouterTestingModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: AuthService, useFactory: () => instance(mockedAuthService) }]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
  });

  it('should create the app', async(() => {
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
