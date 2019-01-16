import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';

/**
 * Submission state of a setting element in component.
 * e.g. is it being submitted, or was submitted succesfully.
 */
enum ElementState {
  /** Identical to what is believed to be in the database. */
  InSync = 'InSync',
  /** Different than what is believed to be in the database.
   *  Not to be confused with an input control claiming to be 'dirty', which might still actually be InSync. */
  Dirty = 'Dirty',
  /** Pending a write to the database. */
  Submitting = 'Submitting',
  /** InSync and was written to the database since last Dirty. */
  Submitted = 'Submitted',
  /** There was an error attempting to submit. */
  Error = 'Error',
  /** The data is invalid. */
  Invalid = 'Invalid'
}

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent extends SubscriptionDisposable implements OnInit {
  // Make enum available to template (see https://github.com/angular/angular/issues/2885 )
  elementState = ElementState;

  form: FormGroup;
  projectId: string;
  project: SFProject;
  /** Elements in this component and their states. */
  controlStates = new Map<string, ElementState>();

  constructor(
    private route: ActivatedRoute,
    private projectService: SFProjectService,
    private noticeService: NoticeService
  ) {
    super();
    this.route.params.subscribe(params => (this.projectId = params['id']));
    this.form = new FormGroup(
      {
        translation: new FormControl(''),
        checking: new FormControl('')
      },
      this.requireOneSelectedBox()
    );
    this.form.setErrors({ required: true });
    this.form.valueChanges.subscribe(newValue => {
      // ignore no-op situations (like form values loading on ngInit)
      if (
        newValue.translation === this.project.translateConfig.enabled &&
        newValue.checking === this.project.checkingConfig.enabled
      ) {
        return;
      }
      if (this.form.valid) {
        const updatedProject = new SFProject({});
        const successHandlers: (() => void)[] = [];
        const failStateHandlers: (() => void)[] = [];
        // Set status and include values for changed form items
        if (newValue.translation !== this.project.translateConfig.enabled) {
          updatedProject['translateConfig'] = { enabled: newValue.translation };
          this.project.translateConfig.enabled = newValue.translation;
          this.updateControlState('translation', successHandlers, failStateHandlers);
        }
        if (newValue.checking !== this.project.checkingConfig.enabled) {
          updatedProject['checkingConfig'] = { enabled: newValue.checking };
          this.project.checkingConfig.enabled = newValue.checking;
          this.updateControlState('checking', successHandlers, failStateHandlers);
        }
        // TODO: Remove these notice service uses when the form has the spinner/checkbox feedback
        projectService
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
      }
    });
    this.setAllControlsToInSync();
  }

  // Update the controlStates for handling submitting a settings change (used to show spinner and success checkmark)
  updateControlState(formControl: string, successHandlers: (() => void)[], failureHandlers: (() => void)[]) {
    this.controlStates.set(formControl, ElementState.Submitting);
    successHandlers.push(() => this.controlStates.set(formControl, ElementState.Submitted));
    failureHandlers.push(() => this.controlStates.set(formControl, ElementState.Error));
  }

  setAllControlsToInSync() {
    this.controlStates.set('checking', ElementState.InSync);
    this.controlStates.set('translation', ElementState.InSync);
  }

  requireOneSelectedBox(): ValidatorFn {
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

  ngOnInit() {
    this.subscribe(this.projectService.onlineGet(this.projectId), searchResults => {
      if (searchResults && searchResults.results) {
        this.project = searchResults.results;
        if (this.project) {
          this.updateSettingsInfo();
        }
      }
    });
  }

  private updateSettingsInfo() {
    this.form.reset({
      translation: this.project.translateConfig.enabled,
      checking: this.project.checkingConfig.enabled
    });
    this.controlStates['checking'] = ElementState.InSync;
    this.controlStates['translation'] = ElementState.InSync;
  }
}
