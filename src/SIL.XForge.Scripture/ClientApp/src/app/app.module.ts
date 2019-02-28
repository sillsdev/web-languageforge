import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ngfModule } from 'angular-file';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { xForgeCommonEntryComponents, XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CheckingModule } from './checking/checking.module';
import { ConnectProjectComponent } from './connect-project/connect-project.component';
import { CoreModule } from './core/core.module';
import { ChangingUsernameDialogComponent } from './my-account/changing-username-dialog/changing-username-dialog.component';
import { DeleteAccountDialogComponent } from './my-account/delete-account-dialog/delete-account-dialog.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { DeleteProjectDialogComponent } from './project-settings/delete-project-dialog/delete-project-dialog.component';
import { ProjectSettingsComponent } from './project-settings/project-settings.component';
import { ProjectComponent } from './project/project.component';
import { SharedModule } from './shared/shared.module';
import { StartComponent } from './start/start.component';
import { SyncComponent } from './sync/sync.component';
import { TranslateModule } from './translate/translate.module';

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    ChangingUsernameDialogComponent,
    ConnectProjectComponent,
    MyAccountComponent,
    DeleteAccountDialogComponent,
    DeleteProjectDialogComponent,
    ProjectSettingsComponent,
    ProjectComponent,
    SyncComponent,
    StartComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    BrowserAnimationsModule,
    CoreModule,
    HttpClientModule,
    ngfModule,
    // not ready for production yet - 2018-11 IJH
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.pwaTest }), // || environment.production }),
    SharedModule,
    TranslateModule,
    CheckingModule,
    UICommonModule,
    XForgeCommonModule
  ],
  providers: [DatePipe],
  entryComponents: [
    ChangingUsernameDialogComponent,
    DeleteAccountDialogComponent,
    DeleteProjectDialogComponent,
    ...xForgeCommonEntryComponents
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
