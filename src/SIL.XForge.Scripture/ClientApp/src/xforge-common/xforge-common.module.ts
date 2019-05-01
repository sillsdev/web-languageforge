import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ngfModule } from 'angular-file';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AvatarModule } from 'ngx-avatar';
import { AvatarComponent } from './avatar/avatar.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { EmailInviteComponent } from './email-invite/email-invite.component';
import { InviteDialogComponent } from './email-invite/invite-dialog.component';
import { DeleteAccountDialogComponent } from './my-account/delete-account-dialog/delete-account-dialog.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { ProjectsComponent } from './projects/projects.component';
import { SaDeleteDialogComponent } from './system-administration/sa-delete-dialog.component';
import { SaUserEntryComponent } from './system-administration/sa-user-entry.component';
import { SaUsersComponent } from './system-administration/sa-users.component';
import { SystemAdministrationComponent } from './system-administration/system-administration.component';
import { UICommonModule } from './ui-common.module';
import { CollaboratorsComponent } from './users/collaborators/collaborators.component';
import { UsersComponent } from './users/users.component';
import { WriteStatusComponent } from './write-status/write-status.component';

const componentExports = [
  AvatarComponent,
  ChangePasswordComponent,
  CollaboratorsComponent,
  DeleteAccountDialogComponent,
  EmailInviteComponent,
  InviteDialogComponent,
  MyAccountComponent,
  ProjectsComponent,
  SaDeleteDialogComponent,
  SaUserEntryComponent,
  SaUsersComponent,
  SystemAdministrationComponent,
  UsersComponent,
  WriteStatusComponent
];

export const xForgeCommonEntryComponents = [InviteDialogComponent, SaDeleteDialogComponent];

@NgModule({
  imports: [
    // AvatarModule included here rather than `ui-common.module.ts` so unit tests don't access the internet
    AvatarModule,
    CommonModule,
    ngfModule,
    OAuthModule,
    RouterModule,
    UICommonModule
  ],
  declarations: componentExports,
  exports: componentExports,
  entryComponents: [DeleteAccountDialogComponent]
})
export class XForgeCommonModule {}
