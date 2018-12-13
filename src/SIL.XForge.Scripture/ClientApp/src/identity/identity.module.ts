import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvatarModule } from 'ngx-avatar';

import { UICommonModule } from '@xforge-common/ui-common.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { IdentityRoutingModule } from './identity-routing.module';
import { IdentityService } from './identity.service';
import { LogInComponent } from './log-in/log-in.component';
import { OpenIdSignUpComponent } from './open-id-sign-up/open-id-sign-up.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';

@NgModule({
  declarations: [
    LogInComponent,
    ForgotPasswordComponent,
    SignUpComponent,
    ResetPasswordComponent,
    OpenIdSignUpComponent
  ],
  imports: [AvatarModule, CommonModule, IdentityRoutingModule, UICommonModule],
  providers: [IdentityService]
})
export class IdentityModule {}
