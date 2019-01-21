import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RedirectHomeGuard } from '@xforge-common/redirect-home.guard';
import { ExternalSignUpComponent } from './external-sign-up/external-sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LogInComponent } from './log-in/log-in.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

const routes: Routes = [
  { path: 'log-in', component: LogInComponent, canActivate: [RedirectHomeGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [RedirectHomeGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'external-sign-up', component: ExternalSignUpComponent, canActivate: [RedirectHomeGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentityRoutingModule {}
