import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { EmailInviteComponent } from './email-invite/email-invite.component';
import { InviteDialogComponent } from './email-invite/invite-dialog.component';
import { DetailSnackBarComponent } from './notice/detail-snack-bar.component';
import { NoticeComponent } from './notice/notice.component';
import { ProjectsComponent } from './projects/projects.component';
import { UICommonModule } from './ui-common.module';

@NgModule({
  imports: [
    CommonModule,
    OAuthModule.forRoot(),
    RouterModule,
    UICommonModule
  ],
  declarations: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent,
    EmailInviteComponent,
    InviteDialogComponent,
    ProjectsComponent
  ],
  exports: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent,
    EmailInviteComponent,
    InviteDialogComponent,
    ProjectsComponent
  ]
})
export class XForgeCommonModule { }
