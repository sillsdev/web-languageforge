import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from 'xforge-common/auth.guard';
import { EditorComponent } from './editor/editor.component';

const routes: Routes = [{ path: 'translate/editor/:textId', component: EditorComponent, canActivate: [AuthGuard] }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TranslateRoutingModule {}
