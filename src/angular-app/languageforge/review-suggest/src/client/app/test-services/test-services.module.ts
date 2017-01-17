import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TestServicesComponent } from './test-services.component';
import { TestServicesRoutingModule } from './test-services-routing.module';

@NgModule({
  imports: [CommonModule, TestServicesRoutingModule],
  declarations: [TestServicesComponent],
  exports: [TestServicesComponent]
})
export class TestServicesModule { }