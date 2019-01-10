import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '@xforge-common/models/project';
import { ProjectService } from '@xforge-common/project.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';

@Component({
  selector: 'app-projects',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent extends SubscriptionDisposable {
  projectId = 0;
  project: Project;
  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private _ProjectService: ProjectService,
    private _Router: Router
  ) {
    super();
    this.subscribe(this._ActivatedRoute.params, params => {
      this.subscribe(_ProjectService.get(params['projectId']), projectData => {
        if (projectData.results) {
          this.project = projectData.results;
        } else {
          this.goHome();
        }
      });
    });
  }

  goHome() {
    this._Router.navigateByUrl('/home');
  }
}
