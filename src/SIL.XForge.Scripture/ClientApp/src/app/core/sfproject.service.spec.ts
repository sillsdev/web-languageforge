import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';

import { SFProjectService } from './sfproject.service';

describe('SFProjectService', () => {
  const oauthServiceStub = {
    getAccessToken() { return 'token'; }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SFProjectService,
        { provide: OAuthService, useValue: oauthServiceStub }
      ]
    });
  });

  it('should be created', inject([SFProjectService], (service: SFProjectService) => {
    expect(service).toBeTruthy();
  }));
});
