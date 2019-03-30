import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { clone } from '@orbit/utils';
import { combineLatest } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ElementState } from 'xforge-common/models/element-state';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { XFValidators } from 'xforge-common/xfvalidators';
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
      sourceParatextId: new FormControl(undefined),
      checking: new FormControl({ value: false, disabled: true }),
      seeOthersResponses: new FormControl(false),
      shareViaEmail: new FormControl(false)
    },
    XFValidators.requireOneWithValue(['translate', 'checking'], true)
  );
  projectId: string;
  project: SFProject;
  sourceProjects: ParatextProject[];

  /** Elements in this component and their states. */
  private controlStates = new Map<string, ElementState>();
  // ensures `get isLoading()` marks the initial load of data in the component since `noticeService.isLoading` is slow
  // to update its status
  private isFirstLoad: boolean = true;
  private paratextProjects: ParatextProject[];
  private previousFormValues: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly dialog: MdcDialog,
    private readonly noticeService: NoticeService,
    private readonly paratextService: ParatextService,
    private readonly projectService: SFProjectService,
    private readonly userService: UserService
  ) {
    super();
    this.noticeService.loadingStarted();
  }

  get isLoading(): boolean {
    return this.isFirstLoad || this.noticeService.isLoading;
  }

  get isLoggedInToParatext(): boolean {
    return this.paratextProjects != null;
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

  private get isOnlyBasedOnInvalid(): boolean {
    let invalidCount = 0;
    const controls = this.form.controls;
    for (const name in this.form.controls) {
      if (controls[name].invalid) {
        invalidCount++;
      }
    }

    return this.form.controls.sourceParatextId.invalid && invalidCount === 1;
  }

  ngOnInit() {
    this.form.disable();
    this.form.setErrors({ required: true });
    this.form.valueChanges.subscribe(newValue => {
      if (this.form.valid || this.isOnlyBasedOnInvalid) {
        let isUpdateNeeded: boolean = false;
        const updatedProject = {
          translateConfig: clone(this.project.translateConfig),
          checkingConfig: clone(this.project.checkingConfig)
        } as SFProject;
        const successHandlers: VoidFunc[] = [];
        const failStateHandlers: VoidFunc[] = [];
        // Set status and include values for changed form items
        if (newValue.translate !== this.project.translateConfig.enabled && this.form.controls.translate.enabled) {
          updatedProject.translateConfig.enabled = newValue.translate;
          this.project.translateConfig.enabled = newValue.translate;
          this.setValidators();
          if (!newValue.translate || (this.form.valid && this.project.translateConfig.sourceParatextId)) {
            this.updateControlState('translate', successHandlers, failStateHandlers);
            isUpdateNeeded = true;
          } else {
            this.controlStates.set('translate', ElementState.InSync);
          }
        }
        if (newValue.sourceParatextId !== this.project.translateConfig.sourceParatextId) {
          if (newValue.translate && newValue.sourceParatextId != null) {
            updatedProject.translateConfig.sourceParatextId = newValue.sourceParatextId;
            updatedProject.translateConfig.sourceInputSystem = ParatextService.getInputSystem(
              this.sourceProjects.find(project => project.paratextId === newValue.sourceParatextId)
            );
            this.project.translateConfig.sourceParatextId = updatedProject.translateConfig.sourceParatextId;
            this.project.translateConfig.sourceInputSystem = updatedProject.translateConfig.sourceInputSystem;
            this.updateControlState('sourceParatextId', successHandlers, failStateHandlers);
            if (this.previousFormValues.sourceParatextId == null) {
              this.updateControlState('translate', successHandlers, failStateHandlers);
            }
            isUpdateNeeded = true;
          }
        }
        if (newValue.checking !== this.project.checkingConfig.enabled) {
          updatedProject.checkingConfig.enabled = newValue.checking;
          this.project.checkingConfig.enabled = newValue.checking;
          this.updateControlState('checking', successHandlers, failStateHandlers);
          isUpdateNeeded = true;
        }
        if (newValue.seeOthersResponses !== this.project.checkingConfig.usersSeeEachOthersResponses) {
          updatedProject.checkingConfig.usersSeeEachOthersResponses = newValue.seeOthersResponses;
          this.project.checkingConfig.usersSeeEachOthersResponses = newValue.seeOthersResponses;
          this.updateControlState('seeOthersResponses', successHandlers, failStateHandlers);
          isUpdateNeeded = true;
        }
        if (newValue.shareViaEmail !== this.project.checkingConfig.share.viaEmail) {
          if (!updatedProject.checkingConfig.share) {
            updatedProject.checkingConfig.share = {};
          }
          if (!this.project.checkingConfig.share) {
            this.project.checkingConfig.share = {};
          }
          updatedProject.checkingConfig.share.viaEmail = newValue.shareViaEmail;
          this.project.checkingConfig.share.viaEmail = newValue.shareViaEmail;
          this.updateControlState('shareViaEmail', successHandlers, failStateHandlers);
          isUpdateNeeded = true;
        }

        if (!isUpdateNeeded) {
          return;
        }
        this.previousFormValues = newValue;
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
      } else if (this.previousFormValues && this.form.errors && this.form.errors.requireAtLeastOneWithValue) {
        // reset invalid form value
        setTimeout(() => this.form.patchValue(this.previousFormValues), 1000);
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
          combineLatest(
            this.projectService.onlineGet(this.projectId).pipe(map(r => r.data)),
            this.paratextService.getProjects()
          )
        )
      ),
      ([project, paratextProjects]) => {
        this.form.enable();
        this.paratextProjects = paratextProjects;
        if (paratextProjects != null) {
          this.sourceProjects = paratextProjects.filter(p => p.projectId !== this.projectId);
        }
        if (project != null) {
          this.project = project;
          if (this.project) {
            this.updateSettingsInfo();
          }
        }
        this.isFirstLoad = false;
        this.noticeService.loadingFinished();
      }
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.noticeService.loadingFinished();
  }

  logInWithParatext(): void {
    const url = '/projects/' + this.projectId + '/settings';
    this.paratextService.logIn(url);
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
    this.previousFormValues = {
      translate: this.project.translateConfig.enabled,
      sourceParatextId: this.project.translateConfig.sourceParatextId,
      checking: this.project.checkingConfig.enabled,
      seeOthersResponses: this.project.checkingConfig.usersSeeEachOthersResponses,
      shareViaEmail: this.project.checkingConfig.share.viaEmail
    };
    this.setValidators();
    this.form.reset(this.previousFormValues);
    if (!this.isLoggedInToParatext) {
      this.form.controls.translate.disable();
    }
    this.setAllControlsToInSync();
  }

  private setValidators() {
    this.project.translateConfig.enabled && this.isLoggedInToParatext
      ? this.form.controls.sourceParatextId.setValidators(Validators.required)
      : this.form.controls.sourceParatextId.setValidators(null);
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
}
