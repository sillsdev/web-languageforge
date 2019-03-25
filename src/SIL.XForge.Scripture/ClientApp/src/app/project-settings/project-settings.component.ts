import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ElementState } from 'xforge-common/models/element-state';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { DeleteProjectDialogComponent } from './delete-project-dialog/delete-project-dialog.component';

type VoidFunc = (() => void);

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  atleastOneError: boolean = false;
  form: FormGroup = new FormGroup(
    {
      translate: new FormControl({ value: false, disabled: true }),
      sourceParatextId: new FormControl('', [Validators.required]),
      checking: new FormControl({ value: false, disabled: true })
    },
    this.requireOneSelectedBox()
  );
  projectId: string;
  project: SFProject;
  sourceProjects: ParatextProject[];

  /** Elements in this component and their states. */
  private controlStates = new Map<string, ElementState>();
  private previousFormValues: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MdcDialog,
    private readonly paratextService: ParatextService,
    private readonly projectService: SFProjectService,
    private readonly noticeService: NoticeService,
    private readonly userService: UserService
  ) {
    super();
    this.noticeService.loadingStarted();
  }

  get isLoading(): boolean {
    return this.noticeService.isLoading;
  }

  get translate(): boolean {
    return this.form.get('translate').value;
  }

  get translateState(): ElementState {
    return this.controlStates.get('translate');
  }

  get sourceParatextIdState(): ElementState {
    return this.controlStates.get('sourceParatextId');
  }

  get checking(): boolean {
    return this.form.get('checking').value;
  }

  get checkingState(): ElementState {
    return this.controlStates.get('checking');
  }

  ngOnInit() {
    this.form.disable();
    this.form.setErrors({ required: true });
    this.form.valueChanges.subscribe(newValue => {
      // ignore no-op situations (like form values loading on ngInit)
      if (
        !this.project ||
        (newValue.translate === this.project.translateConfig.enabled &&
          newValue.checking === this.project.checkingConfig.enabled &&
          newValue.sourceParatextId === this.project.translateConfig.sourceParatextId)
      ) {
        return;
      }

      if (this.form.valid) {
        this.previousFormValues = newValue;
        this.atleastOneError = false;
        const updatedProject = {} as SFProject;
        const successHandlers: VoidFunc[] = [];
        const failStateHandlers: VoidFunc[] = [];
        // Set status and include values for changed form items
        if (newValue.translate !== this.project.translateConfig.enabled) {
          updatedProject.translateConfig = { enabled: newValue.translate };
          this.project.translateConfig.enabled = newValue.translate;
          this.updateControlState('translate', successHandlers, failStateHandlers);
        }
        if (newValue.sourceParatextId !== this.project.translateConfig.sourceParatextId) {
          if (newValue.translate && newValue.sourceParatextId != null) {
            updatedProject.translateConfig = { enabled: newValue.translate };
            updatedProject.translateConfig.sourceParatextId = newValue.sourceParatextId;
            updatedProject.translateConfig.sourceInputSystem = ParatextService.getInputSystem(
              this.sourceProjects.find(project => project.paratextId === newValue.sourceParatextId)
            );
            this.project.translateConfig.sourceParatextId = updatedProject.translateConfig.sourceParatextId;
            this.project.translateConfig.sourceInputSystem = updatedProject.translateConfig.sourceInputSystem;
            this.updateControlState('sourceParatextId', successHandlers, failStateHandlers);
          }
        }
        if (newValue.checking !== this.project.checkingConfig.enabled) {
          updatedProject.checkingConfig = { enabled: newValue.checking };
          this.project.checkingConfig.enabled = newValue.checking;
          this.updateControlState('checking', successHandlers, failStateHandlers);
        }
        this.projectService
          .onlineUpdateAttributes(this.project.id, updatedProject)
          .then(() => {
            while (successHandlers.length) {
              successHandlers.pop().call(this);
            }
          })
          .catch(() => {
            while (failStateHandlers.length) {
              failStateHandlers.pop().call(this);
            }
          });
      } else {
        // reset invalid form value
        setTimeout(() => this.form.setValue(this.previousFormValues), 1000);
        this.atleastOneError = true;
      }
    });
    this.setAllControlsToInSync();
    this.subscribe(
      this.route.params.pipe(
        tap(params => {
          this.noticeService.loadingStarted();
          this.projectId = params['projectId'];
          this.form.disable();
        }),
        switchMap(() =>
          combineLatest(this.projectService.onlineGet(this.projectId), this.paratextService.getProjects())
        )
      ),
      ([project, paratextProjects]) => {
        if (paratextProjects != null) {
          this.sourceProjects = paratextProjects.filter(p => p.projectId !== this.projectId);
        }
        if (project != null) {
          this.project = project;
          if (this.project) {
            this.updateSettingsInfo();
          }
        }
        this.noticeService.loadingFinished();
        this.form.enable();
      }
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.noticeService.loadingFinished();
  }

  openDeleteProjectDialog(): void {
    const config: MdcDialogConfig = {
      data: { name: this.project.projectName }
    };
    const dialogRef = this.dialog.open(DeleteProjectDialogComponent, config);
    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'accept') {
        await this.userService.updateCurrentProjectId();
        await this.projectService.onlineDelete(this.projectId);
      }
    });
  }

  // Update the controlStates for handling submitting a settings change (used to show spinner and success checkmark)
  private updateControlState(formControl: string, successHandlers: VoidFunc[], failureHandlers: VoidFunc[]) {
    this.controlStates.set(formControl, ElementState.Submitting);
    successHandlers.push(() => this.controlStates.set(formControl, ElementState.Submitted));
    failureHandlers.push(() => this.controlStates.set(formControl, ElementState.Error));
  }

  private setAllControlsToInSync() {
    this.controlStates.set('checking', ElementState.InSync);
    this.controlStates.set('translate', ElementState.InSync);
    this.controlStates.set('sourceParatextId', ElementState.InSync);
  }

  private requireOneSelectedBox(): ValidatorFn {
    return function validate(formGroup: FormGroup) {
      let checked = 0;

      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.controls[key];

        if (control.value === true) {
          checked++;
        }
      });

      if (checked < 1) {
        return {
          requireCheckboxesToBeChecked: true
        };
      }

      return null;
    };
  }

  private updateSettingsInfo() {
    const sourceParatextId = this.project.translateConfig.sourceParatextId
      ? this.project.translateConfig.sourceParatextId
      : '';
    this.previousFormValues = {
      translate: this.project.translateConfig.enabled,
      sourceParatextId,
      checking: this.project.checkingConfig.enabled
    };
    this.form.reset(this.previousFormValues);
    this.controlStates.set('checking', ElementState.InSync);
    this.controlStates.set('translate', ElementState.InSync);
    this.controlStates.set('sourceParatextId', ElementState.InSync);
  }
}
