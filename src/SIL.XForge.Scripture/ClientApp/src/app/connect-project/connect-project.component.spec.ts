import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MatCardModule, MatCheckboxModule, MatOptionModule, MatProgressBarModule, MatSelectModule
} from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { instance, mock } from 'ts-mockito';

import { ConnectProjectComponent } from './connect-project.component';

describe('ConnectProjectComponent', () => {
  let component: ConnectProjectComponent;
  let fixture: ComponentFixture<ConnectProjectComponent>;
  const oauthServiceStub = mock(OAuthService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatCheckboxModule,
        MatOptionModule,
        MatProgressBarModule,
        MatSelectModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule
      ],
      declarations: [ ConnectProjectComponent ],
      providers: [
        { provide: OAuthService, useFactory: () => instance(oauthServiceStub) }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
