import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatOptionModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSnackBarModule
} from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { ChangePasswordComponent } from '@xforge-common/change-password/change-password.component';
import { DetailSnackBarComponent } from '@xforge-common/notice/detail-snack-bar.component';
import { XForgeCommonModule } from '@xforge-common/xforge-common.module';
import { AppComponent } from './app.component';
import { ConnectProjectComponent } from './connect-project/connect-project.component';
import { CoreModule } from './core/core.module';
import { CounterComponent } from './counter/counter.component';
import { FetchDataComponent } from './fetch-data/fetch-data.component';
import { HomeComponent } from './home/home.component';
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
    ConnectProjectComponent,
    RealtimeComponent
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
    MatSnackBarModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: 'counter', component: CounterComponent },
      { path: 'fetch-data', component: FetchDataComponent },
      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'connect-project', component: ConnectProjectComponent },
      { path: 'realtime', component: RealtimeComponent }
    ]),
    SharedModule,
    XForgeCommonModule
  ],
  providers: [],
  entryComponents: [DetailSnackBarComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
