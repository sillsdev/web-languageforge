import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatDialogModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatToolbarModule
} from '@angular/material';
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
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    OAuthModule.forRoot(),
    PasswordStrengthMeterModule,
    ReactiveFormsModule,
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
