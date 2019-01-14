import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { fakeAsync, inject, TestBed } from '@angular/core/testing';
import { RecordIdentity } from '@orbit/data';
import { of } from 'rxjs';
import { anything, instance, mock, when } from 'ts-mockito';

import { SFUser } from 'src/app/core/models/sfuser';
import { AuthService } from './auth.service';
import { JsonApiService, QueryResults } from './json-api.service';
import { Resource } from './models/resource';
import { User } from './models/user';
import { UserService } from './user.service';

class TestUser extends User {
  static readonly TYPE: string = 'user';

  constructor(init?: Partial<TestUser>) {
    super(TestUser.TYPE, init);
  }
}

export class StubQueryResults<T> implements QueryResults<T> {
  constructor(public readonly results: T, public readonly totalPagedCount?: number) {}

  getIncluded<TInclude extends Resource>(_identity: RecordIdentity): TInclude {
    return null;
  }

  getManyIncluded<TInclude extends Resource>(_identities: RecordIdentity[]): TInclude[] {
    return null;
  }
}

@Injectable()
class TestUserService extends UserService<TestUser> {
  constructor(jsonApiService: JsonApiService, authService: AuthService) {
    super(TestUser.TYPE, jsonApiService, authService);
  }
}

describe('UserService', () => {
  const mockedJsonApiService = mock(JsonApiService);
  const mockedAuthService = mock(AuthService);

  when(mockedJsonApiService.getAll(TestUser.TYPE, anything())).thenCall((type: any, parameters: any) => {
    if (parameters.filters[0].value === 'sallyusername') {
      return of(
        new StubQueryResults([
          new SFUser({
            name: 'sally jones',
            username: 'sallyusername',
            email: 'sally@example.com'
          })
        ])
      );
    }
    // Returning null for no match doesn't seem right but it appears to be the behaviour of json-api.service.
    return null;
  });

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

  it('should be created', inject([UserService], (userService: UserService) => {
    expect(userService).toBeTruthy();
  }));

  describe('findUsers', () => {
    it('fails to fetch nonexistent user', inject(
      [UserService],
      fakeAsync((userService: UserService) => {
        const matches$ = userService.findUsers('nonexistentusername');
        expect(matches$).toBeNull();
      })
    ));

    it('finds existing user', inject(
      [UserService],
      fakeAsync((userService: UserService) => {
        const matches$ = userService.findUsers('sallyusername');
        expect(matches$).not.toBeNull();
        matches$.subscribe(result => {
          expect(result.results.length).toEqual(1);
          expect(result.results[0].username).toEqual('sallyusername');
        });
      })
    ));
  });
});
