import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LdapiDashboardComponent } from './components/ldapi-dashboard.component';
import { LayoutModule } from '@angular/cdk/layout';
import { DataTableComponent } from './components/data-table.component';

// Angular MDC (use this for future dev work)
import { MDCDataTableModule } from '@angular-mdc/web/data-table';
import { MdcIconModule } from '@angular-mdc/web/icon';
import { MdcMenuModule } from '@angular-mdc/web/menu';
import { MdcTopAppBarModule } from '@angular-mdc/web/top-app-bar';
import { MdcDialogModule } from '@angular-mdc/web/dialog';
import { MdcSnackbarModule } from '@angular-mdc/web/snackbar';
import { MdcCheckboxModule } from '@angular-mdc/web/checkbox';

// Angular Material (phase this out unless MDC doesn't have something we need)
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SingleUserComponent } from './single-user/single-user.component';
import { UsersComponent } from './users/users.component';
import { SingleProjectComponent } from './single-project/single-project.component';
import { ProjectsComponent } from './projects/projects.component';
import { LoginComponent } from './login/login.component';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';
import { ChangePasswordFormComponent } from './change-password-form/change-password-form.component';
import { UserDetailsFormComponent } from './user-details-form/user-details-form.component';

@NgModule({
  declarations: [
    AppComponent,
    LdapiDashboardComponent,
    DataTableComponent,
    SingleUserComponent,
    UsersComponent,
    SingleProjectComponent,
    ProjectsComponent,
    LoginComponent,
    TypeaheadComponent,
    ChangePasswordFormComponent,
    MessageDialogComponent,
    UserDetailsFormComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatToolbarModule,
    MDCDataTableModule,
    MdcMenuModule,
    MdcIconModule,
    MdcTopAppBarModule,
    MdcDialogModule,
    MdcSnackbarModule,
    MdcCheckboxModule,
    LayoutModule
  ],
  providers: [],
  entryComponents: [MessageDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
