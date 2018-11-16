import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { OAuthModule } from 'angular-oauth2-oidc';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { EmailInviteComponent } from './email-invite/email-invite.component';
import { DetailSnackBarComponent } from './notice/detail-snack-bar.component';
import { NoticeComponent } from './notice/notice.component';
import { UICommonModule } from './ui-common.module';

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot(),
    PasswordStrengthMeterModule,
    UICommonModule
  ],
  declarations: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent,
    EmailInviteComponent
  ],
  exports: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent,
    EmailInviteComponent
  ]
})
export class XForgeCommonModule { }
