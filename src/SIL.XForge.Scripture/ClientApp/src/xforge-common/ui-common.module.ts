import {
  MdcButtonModule,
  MdcCardModule,
  MdcCheckboxModule,
  MdcDrawerModule,
  MdcFormFieldModule,
  MdcIconButtonModule,
  MdcIconModule,
  MdcListModule,
  MdcMenuModule,
  MdcSnackbarModule,
  MdcTextFieldModule,
  MdcTopAppBarModule
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
  MatTableModule
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
  MdcButtonModule,
  MdcCardModule,
  MdcCheckboxModule,
  MdcDrawerModule,
  MdcFormFieldModule,
  MdcIconModule,
  MdcIconButtonModule,
  MdcListModule,
  MdcSnackbarModule,
  MdcTextFieldModule,
  MdcTopAppBarModule,
  MdcMenuModule,
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
