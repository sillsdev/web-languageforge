import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { AuthService } from './auth.service';
import { JsonApiService } from './json-api.service';
import { User } from './models/user';
import { UserService } from './user.service';

class TestUser extends User {
  static readonly TYPE: string = 'user';

  constructor(init?: Partial<TestUser>) {
    super(TestUser.TYPE, init);
  }
}

@Injectable()
class TestUserService extends UserService<TestUser> {
  constructor(jsonApiService: JsonApiService, authService: AuthService, http: HttpClient) {
    super(TestUser.TYPE, jsonApiService, authService, http);
  }
}

describe('UserService', () => {
  const mockedJsonApiService = mock(JsonApiService);
  const mockedAuthService = mock(AuthService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: UserService, useClass: TestUserService },
        { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) },
        { provide: AuthService, useFactory: () => instance(mockedAuthService) }
      ]
    });
  });

  it('should be created', inject([UserService], (service: UserService) => {
    expect(service).toBeTruthy();
  }));
});
