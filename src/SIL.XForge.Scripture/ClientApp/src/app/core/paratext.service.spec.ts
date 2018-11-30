import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { AuthService } from '@xforge-common/auth.service';
import { ParatextService } from './paratext.service';

describe('ParatextService', () => {
  const mockedAuthService = mock(AuthService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParatextService, { provide: AuthService, useFactory: () => instance(mockedAuthService) }]
    });
  });

  it('should be created', inject([ParatextService], (service: ParatextService) => {
    expect(service).toBeTruthy();
  }));
});
