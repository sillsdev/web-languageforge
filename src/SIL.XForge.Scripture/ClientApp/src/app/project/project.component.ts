import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { SFProjectService } from '../core/sfproject.service';

@Component({
  selector: 'app-projects',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent extends SubscriptionDisposable implements OnInit {
  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectService: SFProjectService,
    private readonly router: Router,
    private readonly userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribe(
      this.route.params.pipe(
        map(params => params['projectId'] as string),
        distinctUntilChanged(),
        filter(projectId => projectId != null),
        switchMap(projectId =>
          this.projectService.get(projectId, [[nameof<SFProject>('users')], [nameof<SFProject>('texts')]])
        )
      ),
      r => {
        const project = r.data;
        if (project == null) {
          return;
        }
        const projectUser = r
          .getManyIncluded<SFProjectUser>(project.users)
          .find(pu => pu.user != null && pu.user.id === this.userService.currentUserId);
        if (projectUser == null) {
          return;
        }
        // navigate to last location
        if (projectUser.selectedTask != null && projectUser.selectedTask !== '') {
          // the user has previously navigated to a location in a task
          let textId: string;
          switch (projectUser.selectedTask) {
            case 'translate':
              textId = projectUser.translateConfig.selectedTextRef;
              break;

            case 'checking':
              // TODO: get last selected text
              break;
          }
          if (textId != null) {
            this.router.navigate(['./', projectUser.selectedTask, textId], {
              relativeTo: this.route,
              replaceUrl: true
            });
          }
        } else if (project.texts != null && project.texts.length > 0) {
          // the user has not navigated anywhere before, so navigate to the default location in the first enabled task
          let task: string;
          if (project.translateConfig != null && project.translateConfig.enabled) {
            task = 'translate';
          } else if (project.checkingConfig != null && project.checkingConfig.enabled) {
            task = 'checking';
          }
          if (task != null) {
            this.router.navigate(['./', task, project.texts[0].id], {
              relativeTo: this.route,
              replaceUrl: true
            });
          }
        }
      }
    );
  }
}
