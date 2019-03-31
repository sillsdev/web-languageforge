import { MdcCheckbox } from '@angular-mdc/web';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { ParatextService } from 'xforge-common/paratext.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { XFValidators } from 'xforge-common/xfvalidators';
import { SFProject } from '../core/models/sfproject';
import { SyncJob } from '../core/models/sync-job';
import { SFProjectUserService } from '../core/sfproject-user.service';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';

interface ConnectProjectFormValues {
  paratextId: string;
  tasks: {
    checking: boolean;
    translate: boolean;
    sourceParatextId: string;
  };
}

@Component({
  selector: 'app-connect-project',
  templateUrl: './connect-project.component.html',
  styleUrls: ['./connect-project.component.scss']
})
export class ConnectProjectComponent extends SubscriptionDisposable implements OnInit {
  connectProjectForm = new FormGroup({
    paratextId: new FormControl(undefined, Validators.required),
    tasks: new FormGroup({
      checking: new FormControl(true),
      translate: new FormControl(false),
      sourceParatextId: new FormControl({ value: undefined, disabled: true })
    })
  });
  targetProjects: ParatextProject[];
  sourceProjects: ParatextProject[];
  state: 'connecting' | 'loading' | 'input' | 'login';

  private translateToggled$ = new Subject<boolean>();
  private projects: ParatextProject[] = null;
  private job: SyncJob;

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
    return this.job != null ? this.job.percentCompleted : 0;
  }

  get connectPending(): boolean {
    return this.connectProgress === 0;
  }

  get showTasks(): boolean {
    const paratextId: string = this.connectProjectForm.controls.paratextId.value;
    const project = this.projects.find(p => p.paratextId === paratextId);
    return project != null && project.projectId == null;
  }

  ngOnInit(): void {
    this.subscribe(this.connectProjectForm.controls.paratextId.valueChanges, (paratextId: string) => {
      this.connectProjectForm.get('tasks.sourceParatextId').reset();
      this.sourceProjects = this.projects.filter(p => p.paratextId !== paratextId);
      this.connectProjectForm.setValidators(
        XFValidators.requireOneWithValue(['tasks.translate', 'tasks.checking'], true)
      );
    });

    this.state = 'loading';
    this.subscribe(this.translateToggled$, (value: boolean) => {
      const sourceParatextId = this.connectProjectForm.get('tasks.sourceParatextId');
      if (value) {
        sourceParatextId.enable();
        sourceParatextId.setValidators(Validators.required);
      } else {
        sourceParatextId.disable();
        sourceParatextId.clearValidators();
      }
      sourceParatextId.updateValueAndValidity();
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

  onTranslateToggled(change: { source: MdcCheckbox; checked: boolean }): void {
    this.translateToggled$.next(change.checked);
  }

  async submit(): Promise<void> {
    if (!this.connectProjectForm.valid) {
      return;
    }
    const values = this.connectProjectForm.value as ConnectProjectFormValues;
    const project = this.projects.find(p => p.paratextId === values.paratextId);
    if (project != null && project.projectId == null) {
      this.state = 'connecting';
      let newProject = new SFProject({
        projectName: project.name,
        paratextId: project.paratextId,
        inputSystem: ParatextService.getInputSystem(project),
        checkingConfig: { enabled: values.tasks.checking },
        translateConfig: { enabled: values.tasks.translate }
      });
      if (values.tasks.translate) {
        const translateSourceProject = this.projects.find(p => p.paratextId === values.tasks.sourceParatextId);
        newProject.translateConfig.sourceParatextId = translateSourceProject.paratextId;
        newProject.translateConfig.sourceInputSystem = ParatextService.getInputSystem(translateSourceProject);
      }

      newProject = await this.projectService.onlineCreate(newProject);
      await this.projectUserService.onlineCreate(newProject.id, this.userService.currentUserId);
      const jobId = await this.syncJobService.start(newProject.id);
      this.subscribe(this.syncJobService.listen(jobId), async job => {
        this.job = job;
        if (!job.isActive) {
          this.router.navigate(['/projects', newProject.id]);
        }
      });
    } else {
      await this.projectUserService.onlineCreate(project.projectId, this.userService.currentUserId);
      this.router.navigate(['/projects', project.projectId]);
    }
  }
}
