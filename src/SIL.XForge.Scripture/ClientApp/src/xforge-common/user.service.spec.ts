import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { AuthService } from './auth.service';
import { JSONAPIService } from './jsonapi.service';
import { UserService } from './user.service';

describe('UserService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);
  const mockedAuthService = mock(AuthService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserService,
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) },
        { provide: AuthService, useFactory: () => instance(mockedAuthService) }
      ]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
