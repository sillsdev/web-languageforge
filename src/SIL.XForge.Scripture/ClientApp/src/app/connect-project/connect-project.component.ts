import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { InputSystem } from 'xforge-common/models/input-system';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { ParatextService } from 'xforge-common/paratext.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { SFProject } from '../core/models/sfproject';
import { SyncJob } from '../core/models/sync-job';
import { SFProjectUserService } from '../core/sfproject-user.service';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';

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

  constructor(
    private readonly paratextService: ParatextService,
    private readonly userService: UserService,
    private readonly projectService: SFProjectService,
    private readonly syncJobService: SyncJobService,
    private readonly projectUserService: SFProjectUserService,
    private readonly router: Router
  ) {
    super();
  }

  get connectProgress(): number {
    return this.job != null ? this.job.percentCompleted * 100 : 0;
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
    if (!this.connectProjectForm.valid) {
      return;
    }
    const values = this.connectProjectForm.value as ConnectProjectFormValues;
    if (values.project.projectId == null) {
      this.state = 'connecting';
      let newProject = new SFProject({
        projectName: values.project.name,
        paratextId: values.project.paratextId,
        inputSystem: this.getInputSystem(values.project),
        checkingConfig: { enabled: values.tasks.checking },
        translateConfig: { enabled: values.tasks.translate }
      });
      if (values.tasks.translate) {
        newProject.translateConfig.sourceParatextId = values.tasks.sourceProject.paratextId;
        newProject.translateConfig.sourceInputSystem = this.getInputSystem(values.tasks.sourceProject);
      }

      newProject = await this.projectService.onlineCreate(newProject);
      await this.projectUserService.onlineCreate(newProject.id, this.userService.currentUserId);
      const jobId = await this.syncJobService.start(newProject.id);
      this.subscribe(this.syncJobService.listen(jobId), async job => {
        this.job = job;
        if (!job.isActive) {
          if (values.tasks.translate) {
            const translationEngine = this.projectService.createTranslationEngine(newProject.id);
            await translationEngine.startTraining();
          }
          this.router.navigate(['/projects', newProject.id]);
        }
      });
    } else {
      await this.projectUserService.onlineCreate(values.project.projectId, this.userService.currentUserId);
      this.router.navigate(['/projects', values.project.projectId]);
    }
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
