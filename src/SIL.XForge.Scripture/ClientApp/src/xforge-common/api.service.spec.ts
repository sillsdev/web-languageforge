import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { ApiService } from './api.service';

describe('ApiService', () => {
  const oauthServiceStub = {
    getAccessToken() { return 'token'; }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ApiService,
        { provide: OAuthService, useValue: oauthServiceStub }
      ]
    });
  });

  it('should be created', inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));
});
