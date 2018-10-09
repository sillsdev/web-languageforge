import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { instance, mock } from 'ts-mockito';

import { SFUserService } from './sfuser.service';

describe('SFUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        SFUserService,
        { provide: OAuthService, useFactory: () => instance(mock(OAuthService)) }
      ]
    });
  });

  it('should be created', inject([SFUserService], (service: SFUserService) => {
    expect(service).toBeTruthy();
  }));
});
