import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '@xforge-common/models/project';
import { ProjectService } from '@xforge-common/project.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-projects',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent extends SubscriptionDisposable {
  project: Project;
  constructor(private activatedRoute: ActivatedRoute, private projectService: ProjectService, private router: Router) {
    super();
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => {
          return projectService.get(params['id']);
        })
      ),
      projectData => {
        if (projectData.results) {
          this.project = projectData.results;
        } else {
          this.goHome();
        }
      }
    );
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }
}
