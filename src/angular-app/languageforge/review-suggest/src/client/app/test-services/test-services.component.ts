import { Component } from '@angular/core';

import { LfApiService } from '../shared/services/lf-api.service';

@Component({
  moduleId: module.id,
  selector: 'test-services',
  templateUrl: 'test-services.component.html'
})

export class TestServicesComponent {
  private result: any;

  constructor(private lfApiService: LfApiService) {
    this.lfApiService.getUserProfile().subscribe (response => {
      this.result = response.data;
      console.log(this.result);
    });
    
  }
}
