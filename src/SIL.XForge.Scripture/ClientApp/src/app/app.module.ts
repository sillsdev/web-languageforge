import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatOptionModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTableModule,
  MatToolbarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { AvatarModule } from 'ngx-avatar';

import { DeleteDialogComponent } from '@xforge-common/delete-dialog/delete-dialog.component';
import { InviteDialogComponent } from '@xforge-common/email-invite/invite-dialog.component';
import { DetailSnackBarComponent } from '@xforge-common/notice/detail-snack-bar.component';
import { SystemAdministrationComponent } from '@xforge-common/system-administration/system-administration.component';
import { UserEntryComponent } from '@xforge-common/system-administration/user-entry.component';
import { UICommonModule } from '@xforge-common/ui-common.module';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConnectProjectComponent } from './connect-project/connect-project.component';
import { CoreModule } from './core/core.module';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
import { ChangingUsernameDialogComponent } from './my-account/changing-username-dialog/changing-username-dialog.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { RealtimeComponent } from './realtime/realtime.component';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    ChangingUsernameDialogComponent,
    ConnectProjectComponent,
    MyAccountComponent,
    SystemAdministrationComponent,
    UserEntryComponent
  ],
  imports: [
    AppRoutingModule,
    AvatarModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatGridListModule,
    MatPaginatorModule,
    MatTableModule,
    MatToolbarModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    // not ready for production yet - 2018-11 IJH
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.pwaTest }), // || environment.production }),
    SharedModule,
    UICommonModule,
    PasswordStrengthMeterModule,
    XForgeCommonModule
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  entryComponents: [
    DetailSnackBarComponent,
    ChangingUsernameDialogComponent,
    DeleteDialogComponent,
    InviteDialogComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
