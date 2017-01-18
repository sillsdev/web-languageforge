import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReviewComponent } from './review.component';
import { LoggedInGuard } from '../shared/logged-in.guard';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: 'review/:id', component: ReviewComponent, canActivate: [LoggedInGuard] }
    ])
  ],
  exports: [RouterModule]
})
export class ReviewRoutingModule { }