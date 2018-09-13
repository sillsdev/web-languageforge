import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { JSONAPIService } from './json-api.service';

describe('JSONAPIService', () => {
  const oauthServiceStub = {
    getAccessToken() { return 'token'; }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        JSONAPIService,
        { provide: OAuthService, useValue: oauthServiceStub }
      ]
    });
  });

  it('should be created', inject([JSONAPIService], (service: JSONAPIService) => {
    expect(service).toBeTruthy();
  }));
});
