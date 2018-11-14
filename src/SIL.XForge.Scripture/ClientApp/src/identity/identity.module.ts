import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UICommonModule } from '@xforge-common/ui-common.module';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { IdentityRoutingModule } from './identity-routing.module';
import { IdentityService } from './identity.service';
import { LogInComponent } from './log-in/log-in.component';

@NgModule({
  declarations: [LogInComponent,
    ForgotPasswordComponent],
  imports: [
    CommonModule,
    IdentityRoutingModule,
    UICommonModule
  ],
  providers: [IdentityService]
})
export class IdentityModule { }
