import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressBarModule,
  MatSnackBarModule
} from '@angular/material';
import { OAuthModule } from 'angular-oauth2-oidc';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';

import { ChangePasswordComponent } from './change-password/change-password.component';
import { DetailSnackBarComponent } from './notice/detail-snack-bar.component';
import { NoticeComponent } from './notice/notice.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatSnackBarModule,
    OAuthModule.forRoot({
      resourceServer: {
        allowedUrls: ['api'],
        sendAccessToken: true
      }
    }),
    PasswordStrengthMeterModule,
    ReactiveFormsModule
  ],
  declarations: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent
  ],
  exports: [
    ChangePasswordComponent,
    DetailSnackBarComponent,
    NoticeComponent
  ]
})
export class XForgeCommonModule {}
