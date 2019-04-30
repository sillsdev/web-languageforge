import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent extends SubscriptionDisposable implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribe(
      this.userService.getCurrentUser().pipe(
        filter(user => user != null),
        switchMap(user => {
          if (user.site != null && user.site.currentProjectId != null) {
            return of(user.site.currentProjectId);
          }
          return this.userService
            .getProjects(user.id)
            .pipe(map(r => (r.data.length > 0 ? r.data[0].project.id : null)));
        }),
        filter(projectId => projectId != null)
      ),
      projectId => this.router.navigate(['./', projectId], { relativeTo: this.route })
    );
  }
}
