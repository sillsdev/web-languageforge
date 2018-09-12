import { inject, TestBed } from '@angular/core/testing';

import { SFProjectService } from './sfproject.service';

describe('SFProjectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SFProjectService]
    });
  });

  it('should be created', inject([SFProjectService], (service: SFProjectService) => {
    expect(service).toBeTruthy();
  }));
});
