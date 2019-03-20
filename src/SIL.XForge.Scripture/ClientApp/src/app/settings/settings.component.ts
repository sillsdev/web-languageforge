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
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  form: FormGroup = new FormGroup(
    {
      translate: new FormControl({ value: false, disabled: true }),
      sourceParatextId: new FormControl('', [Validators.required]),
      checking: new FormControl({ value: false, disabled: true }),
      seeOthersResponses: new FormControl(false),
      shareViaEmail: new FormControl(false)
    },
    this.requireOneSelectedTask()
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

  get seeOthersResponses(): boolean {
    return this.form.get('seeOthersResponses').value;
  }

  get seeOthersResponsesState(): ElementState {
    return this.controlStates.get('seeOthersResponses');
  }

  get shareViaEmail(): boolean {
    return this.form.get('shareViaEmail').value;
  }

  get shareViaEmailState(): ElementState {
    return this.controlStates.get('shareViaEmail');
  }

  ngOnInit() {
    this.form.disable();
    this.form.setErrors({ required: true });
    this.form.valueChanges.subscribe(newValue => {
      // ignore no-op situations (like form values loading on ngInit)
      if (
        !this.project ||
        (newValue.translate === this.project.translateConfig.enabled &&
          newValue.sourceParatextId === this.project.translateConfig.sourceParatextId &&
          newValue.checking === this.project.checkingConfig.enabled &&
          newValue.seeOthersResponses === this.project.checkingConfig.usersSeeEachOthersResponses &&
          newValue.shareViaEmail === this.project.checkingConfig.share.viaEmail)
      ) {
        return;
      }

      if (this.form.valid) {
        this.previousFormValues = newValue;
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
        if (newValue.seeOthersResponses !== this.project.checkingConfig.usersSeeEachOthersResponses) {
          updatedProject.checkingConfig = { enabled: newValue.checking };
          updatedProject.checkingConfig.usersSeeEachOthersResponses = newValue.seeOthersResponses;
          this.project.checkingConfig.usersSeeEachOthersResponses = newValue.seeOthersResponses;
          this.updateControlState('seeOthersResponses', successHandlers, failStateHandlers);
        }
        if (newValue.shareViaEmail !== this.project.checkingConfig.share.viaEmail) {
          updatedProject.checkingConfig = { enabled: newValue.checking };
          if (!updatedProject.checkingConfig.share) {
            updatedProject.checkingConfig.share = {};
          }
          if (!this.project.checkingConfig.share) {
            this.project.checkingConfig.share = {};
          }
          updatedProject.checkingConfig.share.viaEmail = newValue.shareViaEmail;
          this.project.checkingConfig.share.viaEmail = newValue.shareViaEmail;
          this.updateControlState('shareViaEmail', successHandlers, failStateHandlers);
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
      } else if (this.form.errors && this.form.errors.requireCheckboxesToBeChecked) {
        // reset invalid form value
        setTimeout(() => this.form.setValue(this.previousFormValues), 1000);
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

  private updateSettingsInfo() {
    const sourceParatextId = this.project.translateConfig.sourceParatextId
      ? this.project.translateConfig.sourceParatextId
      : '';
    this.previousFormValues = {
      translate: this.project.translateConfig.enabled,
      sourceParatextId,
      checking: this.project.checkingConfig.enabled,
      seeOthersResponses: this.project.checkingConfig.usersSeeEachOthersResponses,
      shareViaEmail: this.project.checkingConfig.share.viaEmail
    };
    this.form.reset(this.previousFormValues);
    this.setAllControlsToInSync();
  }

  private setAllControlsToInSync() {
    this.controlStates.set('translate', ElementState.InSync);
    this.controlStates.set('sourceParatextId', ElementState.InSync);
    this.controlStates.set('checking', ElementState.InSync);
    this.controlStates.set('seeOthersResponses', ElementState.InSync);
    this.controlStates.set('shareViaEmail', ElementState.InSync);
  }

  // Update the controlStates for handling submitting a settings change (used to show spinner and success checkmark)
  private updateControlState(formControl: string, successHandlers: VoidFunc[], failureHandlers: VoidFunc[]) {
    this.controlStates.set(formControl, ElementState.Submitting);
    successHandlers.push(() => this.controlStates.set(formControl, ElementState.Submitted));
    failureHandlers.push(() => this.controlStates.set(formControl, ElementState.Error));
  }

  private requireOneSelectedTask(): ValidatorFn {
    return function validate(formGroup: FormGroup) {
      let checked = 0;

      ['translate', 'checking'].forEach(key => {
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
}
