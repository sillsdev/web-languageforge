import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatProgressBarModule,
  MatProgressSpinnerModule, MatSelectModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { PasswordStrengthMeterModule } from 'angular-password-strength-meter';
import { ChangePasswordComponent } from '../xforge-common/change-password/change-password.component';
import { AppComponent } from './app.component';
import { ConnectProjectComponent } from './connect-project/connect-project.component';
import { CoreModule } from './core/core.module';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { DetailSnackBarComponent } from './notice/detail-snack-bar.component';
import { NoticeComponent } from './notice/notice.component';
import { SystemAdministrationComponent } from './system-administration/system-administration.component';


@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    HomeComponent,
    CounterComponent,
    FetchDataComponent,
    NoticeComponent,
    DetailSnackBarComponent,
    ChangePasswordComponent,
    ConnectProjectComponent,
    SystemAdministrationComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    CoreModule,
    FormsModule,
    FlexLayoutModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatOptionModule,
    MatSnackBarModule,
    MatSlideToggleModule,
    NgbModule,
    PasswordStrengthMeterModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    XForgeCommonModule,
<<<<<<< a16633b74eb5295e2fd1719c1cb0aa7ffbba8fdc
    CoreModule,
    PasswordStrengthMeterModule,
=======
    CoreModule,    
>>>>>>> Fix: SF-50 Use Material in Change Password component
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'connect-project', component: ConnectProjectComponent },
      { path: 'system-administration', component: SystemAdministrationComponent },
    ]),
    XForgeCommonModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
