import { inject, TestBed } from '@angular/core/testing';

import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilityService]
    });
  });

  it('should be created', inject([UtilityService], (service: UtilityService) => {
    expect(service).toBeTruthy();
  }));

  it('should be the length of a uuid', inject([UtilityService], (service: UtilityService) => {
    const testUuid = UtilityService.uuid();
    expect(testUuid.length).toEqual(36);
  }));

  it('should create two unique uuids', inject([UtilityService], (service: UtilityService) => {
    const uuid1 = UtilityService.uuid();
    const uuid2 = UtilityService.uuid();
    expect(uuid1 === uuid2).toBeFalsy();
  }));
});
