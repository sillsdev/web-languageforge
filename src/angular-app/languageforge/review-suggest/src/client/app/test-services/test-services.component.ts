import { Component } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'test-services',
  templateUrl: 'test-services.component.html'
})

export class TestServicesComponent {
  private result: any;

  constructor() {
    this.result = "your mom";
  }
}
