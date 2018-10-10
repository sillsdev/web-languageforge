import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { InputSystem } from '@xforge-common/models/input-system';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { UserService } from '@xforge-common/user.service';
import { ParatextService } from '../core/paratext.service';
import { SFProjectUserService } from '../core/sfproject-user.service';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';
import { ParatextProject } from '../shared/models/paratext-project';
import { SyncJob } from '../shared/models/sync-job';

interface ConnectProjectFormValues {
  project: ParatextProject;
  tasks: {
    checking: boolean;
    translate: boolean;
    sourceProject: ParatextProject;
  };
}

@Component({
  selector: 'app-connect-project',
  templateUrl: './connect-project.component.html',
  styleUrls: ['./connect-project.component.scss']
})
export class ConnectProjectComponent extends SubscriptionDisposable implements OnInit {
  connectProjectForm = new FormGroup({
    project: new FormControl(null, Validators.required),
    tasks: new FormGroup({
      checking: new FormControl(true),
      translate: new FormControl(false),
      sourceProject: new FormControl({ value: null, disabled: true })
    })
  });
  targetProjects: ParatextProject[];
  sourceProjects: ParatextProject[];
  state: 'connecting' | 'loading' | 'input' | 'login';

  private job: SyncJob;
  private projects: ParatextProject[] = null;

  constructor(private readonly paratextService: ParatextService, private readonly userService: UserService,
    private readonly projectService: SFProjectService, private readonly syncJobService: SyncJobService,
    private readonly projectUserService: SFProjectUserService, private readonly router: Router
  ) {
    super();
  }

  get connectProgress(): number {
    return this.job != null ? this.job.attributes.percentCompleted * 100 : 0;
  }

  get connectPending(): boolean {
    return this.connectProgress === 0;
  }

  get showTasks(): boolean {
    const project = this.connectProjectForm.get('project').value as ParatextProject;
    return project != null && project.projectId == null;
  }

  ngOnInit(): void {
    this.subscribe(this.connectProjectForm.get('project').valueChanges, (value: ParatextProject) => {
      this.connectProjectForm.get('tasks.sourceProject').reset();
      this.sourceProjects = this.projects.filter(p => p !== value);
    });

    this.state = 'loading';
    this.subscribe(this.connectProjectForm.get('tasks.translate').valueChanges, (value: boolean) => {
      const sourceProject = this.connectProjectForm.get('tasks.sourceProject');
      if (value) {
        sourceProject.enable();
        sourceProject.setValidators(Validators.required);
      } else {
        sourceProject.disable();
        sourceProject.clearValidators();
      }
      sourceProject.updateValueAndValidity();
    });


    this.subscribe(this.paratextService.getProjects(), projects => {
      this.projects = projects;
      if (projects != null) {
        this.targetProjects = projects.filter(p => p.isConnectable);
        this.state = 'input';
      } else {
        this.state = 'login';
      }
    });
  }

  logInWithParatext(): void {
    this.paratextService.logIn('/connect-project');
  }

  async submit(): Promise<void> {
    const values = this.connectProjectForm.value as ConnectProjectFormValues;
    if (values.project.projectId == null) {
      this.state = 'connecting';
      const newProject = this.projectService.newResource({
        attributes: {
          projectName: values.project.name,
          paratextId: values.project.paratextId,
          inputSystem: this.getInputSystem(values.project),
          checkingConfig: {
            enabled: values.tasks.checking
          },
          translateConfig: {
            enabled: values.tasks.translate
          }
        }
      });
      if (values.tasks.translate) {
        newProject.attributes.translateConfig.sourceParatextId = values.tasks.sourceProject.paratextId;
        newProject.attributes.translateConfig.sourceInputSystem = this.getInputSystem(values.tasks.sourceProject);
      }

      const newProjectId = await this.projectService.onlineCreate(newProject);
      await this.addCurrentUserToProject(newProjectId);
      const jobId = await this.syncJobService.start(newProjectId);
      this.subscribe(this.syncJobService.listen(jobId), job => {
        this.job = job;
        if (!SyncJobService.isActive(job)) {
          this.router.navigate(['/home']);
        }
      });
    } else {
      await this.addCurrentUserToProject(values.project.projectId);
      this.router.navigate(['/home']);
    }
  }

  private async addCurrentUserToProject(projectId: string): Promise<void> {
    const newProjectUser = this.projectUserService.newResource({
      relationships: {
        user: this.userService.hasOne(this.userService.currentUserId),
        project: this.projectService.hasOne(projectId)
      }
    });
    await this.projectUserService.onlineCreate(newProjectUser);
  }

  private getInputSystem(project: ParatextProject): InputSystem {
    return {
      tag: project.languageTag,
      languageName: project.languageName,
      abbreviation: project.languageTag,
      isRightToLeft: false
    };
  }
}
