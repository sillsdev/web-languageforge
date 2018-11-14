import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LogInComponent } from './log-in/log-in.component';

const routes: Routes = [
  { path: 'log-in', component: LogInComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentityRoutingModule { }
