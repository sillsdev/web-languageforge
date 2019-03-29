import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'xforge-common/auth.guard';
import { EditorComponent } from './editor/editor.component';
import { TranslateOverviewComponent } from './translate-overview/translate-overview.component';

const routes: Routes = [
  { path: 'projects/:projectId/translate/:textId', component: EditorComponent, canActivate: [AuthGuard] },
  { path: 'projects/:projectId/translate', component: TranslateOverviewComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TranslateRoutingModule {}
