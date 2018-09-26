import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { instance, mock } from 'ts-mockito';

import { ParatextService } from './paratext.service';

describe('ParatextService', () => {
  const oauthServiceStub = mock(OAuthService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ParatextService,
        { provide: OAuthService, useFactory: () => instance(oauthServiceStub) }
      ]
    });
  });

  it('should be created', inject([ParatextService], (service: ParatextService) => {
    expect(service).toBeTruthy();
  }));
});
