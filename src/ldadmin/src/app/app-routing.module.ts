import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { ProjectsComponent } from './projects/projects.component';
import { SingleProjectComponent } from './single-project/single-project.component';
import { AdminGuard } from './admin.guard';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';

const routes: Routes = [
  { path: 'admin',
    children: [
      { path: 'users', component: UsersComponent },
      { path: 'users/:id', component: SingleUserComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'projects/:id', component: SingleProjectComponent },
    ],
    canActivate: [AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }]
})
export class AppRoutingModule { }
