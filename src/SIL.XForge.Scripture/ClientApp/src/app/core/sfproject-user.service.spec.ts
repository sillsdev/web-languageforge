import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { SFProjectUserService } from './sfproject-user.service';

describe('SFProjectUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [SFProjectUserService]
    });
  });

  it('should be created', inject([SFProjectUserService], (service: SFProjectUserService) => {
    expect(service).toBeTruthy();
  }));
});
