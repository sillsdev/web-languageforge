import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from './jsonapi.service';
import { UserService } from './user.service';

describe('UserService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);
  const mockedOAuthService = mock(OAuthService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserService,
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) },
        { provide: OAuthService, useFactory: () => instance(mockedOAuthService) }
      ]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
