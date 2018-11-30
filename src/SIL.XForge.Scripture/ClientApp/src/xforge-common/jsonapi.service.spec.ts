import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from './jsonapi.service';
import { DomainModel } from './models/domain-model';

describe('JSONAPIService', () => {
  const mockedDomainModel = mock(DomainModel);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JSONAPIService, { provide: DomainModel, useFactory: () => instance(mockedDomainModel) }]
    });
  });

  it('should be created', inject([JSONAPIService], (service: JSONAPIService) => {
    expect(service).toBeTruthy();
  }));
});
