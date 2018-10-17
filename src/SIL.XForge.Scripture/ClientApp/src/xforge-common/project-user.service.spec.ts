import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { ProjectUserService } from './project-user.service';

describe('ProjectUserService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [ProjectUserService]
    });
  });

  it('should be created', inject([ProjectUserService], (service: ProjectUserService) => {
    expect(service).toBeTruthy();
  }));
});
