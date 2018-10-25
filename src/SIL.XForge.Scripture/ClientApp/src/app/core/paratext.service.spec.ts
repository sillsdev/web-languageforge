import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { instance, mock } from 'ts-mockito';

import { ParatextService } from './paratext.service';
import { SFUserService } from './sfuser.service';

describe('ParatextService', () => {
  const mockedOAuthService = mock(OAuthService);
  const mockedSFUserService = mock(SFUserService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ParatextService,
        { provide: OAuthService, useFactory: () => instance(mockedOAuthService) },
        { provide: SFUserService, useFactory: () => instance(mockedSFUserService) }
      ]
    });
  });

  it('should be created', inject([ParatextService], (service: ParatextService) => {
    expect(service).toBeTruthy();
  }));
});
