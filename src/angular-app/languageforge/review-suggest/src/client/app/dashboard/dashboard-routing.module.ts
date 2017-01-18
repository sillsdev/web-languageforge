import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LoggedInGuard } from '../shared/logged-in.guard';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent, canActivate: [LoggedInGuard] }
    ])
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }