import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TestServicesComponent } from './test-services.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'test-services', component: TestServicesComponent }
    ])
  ],
  exports: [RouterModule]
})
export class TestServicesRoutingModule { }