import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RedirectRootGuard } from '@xforge-common/redirect-root.guard';
import { ExternalSignUpComponent } from './external-sign-up/external-sign-up.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LogInComponent } from './log-in/log-in.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

const routes: Routes = [
  { path: 'log-in', component: LogInComponent, canActivate: [RedirectRootGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [RedirectRootGuard] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'external-sign-up', component: ExternalSignUpComponent, canActivate: [RedirectRootGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IdentityRoutingModule {}
