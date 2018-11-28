import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';

import { DeleteDialogComponent } from '@xforge-common/delete-dialog/delete-dialog.component';
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
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['json-api'],
        sendAccessToken: true
      }
    }),
    RouterModule,
    UICommonModule
  ],
  declarations: [
    ChangePasswordComponent,
    DeleteDialogComponent,
    DetailSnackBarComponent,
    EmailInviteComponent,
    InviteDialogComponent,
    ProjectsComponent,
    NoticeComponent
  ],
  exports: [
    ChangePasswordComponent,
    DeleteDialogComponent,
    DetailSnackBarComponent,
    EmailInviteComponent,
    InviteDialogComponent,
    ProjectsComponent,
    NoticeComponent
  ]
})
export class XForgeCommonModule {}
