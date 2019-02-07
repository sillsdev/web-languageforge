import {
  MdcButtonModule,
  MdcCardModule,
  MdcCheckboxModule,
  MdcDialogModule,
  MdcDrawerModule,
  MdcFormFieldModule,
  MdcIconButtonModule,
  MdcIconModule,
  MdcLinearProgressModule,
  MdcListModule,
  MdcMenuModule,
  MdcSnackbarModule,
  MdcTextFieldModule,
  MdcTopAppBarModule,
  MdcTypographyModule
} from '@angular-mdc/web';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule
} from '@angular/material';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { RecaptchaModule } from 'ng-recaptcha';
import { RecaptchaFormsModule } from 'ng-recaptcha/forms';

const modules = [
  FlexLayoutModule,
  FormsModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatNativeDateModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatTabsModule,
  MdcButtonModule,
  MdcCardModule,
  MdcCheckboxModule,
  MdcDialogModule,
  MdcDrawerModule,
  MdcFormFieldModule,
  MdcIconModule,
  MdcIconButtonModule,
  MdcLinearProgressModule,
  MdcListModule,
  MdcSnackbarModule,
  MdcTextFieldModule,
  MdcTopAppBarModule,
  MdcMenuModule,
  MdcTypographyModule,
  PasswordStrengthMeterModule,
  ReactiveFormsModule,
  RecaptchaModule,
  RecaptchaFormsModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class UICommonModule {}
