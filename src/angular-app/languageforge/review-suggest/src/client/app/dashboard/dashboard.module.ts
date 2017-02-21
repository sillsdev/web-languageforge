import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { MaterializeModule } from '../shared/materialize.module';

@NgModule({
  imports: [CommonModule, DashboardRoutingModule, MaterializeModule],
  declarations: [DashboardComponent],
  exports: [DashboardComponent]
})
export class DashboardModule { }