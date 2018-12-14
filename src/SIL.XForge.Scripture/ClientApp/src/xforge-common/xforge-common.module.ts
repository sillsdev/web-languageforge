import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AvatarModule } from 'ngx-avatar';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { EmailInviteComponent } from './email-invite/email-invite.component';
import { InviteDialogComponent } from './email-invite/invite-dialog.component';
import { DetailSnackBarComponent } from './notice/detail-snack-bar.component';
import { NoticeComponent } from './notice/notice.component';
import { ProjectsComponent } from './projects/projects.component';
import { SaDeleteDialogComponent } from './system-administration/sa-delete-dialog.component';
import { SaUserEntryComponent } from './system-administration/sa-user-entry.component';
import { SaUsersComponent } from './system-administration/sa-users.component';
import { SystemAdministrationComponent } from './system-administration/system-administration.component';
import { UICommonModule } from './ui-common.module';

const componentExports = [
  ChangePasswordComponent,
  DetailSnackBarComponent,
  EmailInviteComponent,
  InviteDialogComponent,
  ProjectsComponent,
  NoticeComponent,
  SaDeleteDialogComponent,
  SaUserEntryComponent,
  SaUsersComponent,
  SystemAdministrationComponent
];

export const xForgeCommonEntryComponents = [DetailSnackBarComponent, InviteDialogComponent, SaDeleteDialogComponent];

@NgModule({
  imports: [
    // AvatarModule included here rather than `ui-common.module.ts` so unit tests don't access the internet
    AvatarModule,
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
  declarations: componentExports,
  exports: componentExports
})
export class XForgeCommonModule {}
