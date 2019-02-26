import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'xforge-common/auth.guard';
import { CheckingOverviewComponent } from './checking-overview/checking-overview.component';
import { CheckingComponent } from './checking/checking.component';

const routes: Routes = [
  { path: 'projects/:projectId/checking/:textId', component: CheckingComponent, canActivate: [AuthGuard] },
  { path: 'projects/:projectId/checking', component: CheckingOverviewComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class CheckingRoutingModule {}
