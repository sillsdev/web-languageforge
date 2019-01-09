import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';

@Component({
  selector: 'app-project-settings',
  templateUrl: './project-settings.component.html',
  styleUrls: ['./project-settings.component.scss']
})
export class ProjectSettingsComponent extends SubscriptionDisposable implements OnInit {
  form: FormGroup;
  projectId: string;
  project: SFProject;

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
        this.project.translateConfig.enabled = newValue.translation;
        this.project.checkingConfig.enabled = newValue.checking;
        const updatedProject = new SFProject({
          checkingConfig: { enabled: newValue.checking },
          translateConfig: { enabled: newValue.translation }
        });
        // TODO: Remove these notice service uses when the form has the spinner/checkbox feedback
        projectService
          .onlineUpdateAttributes(this.project.id, updatedProject)
          .then(() => this.noticeService.push(NoticeService.SUCCESS, 'Settings updated.'))
          .catch(() =>
            this.noticeService.push(NoticeService.WARN, 'Failed to update settings on the server. Connection problem?')
          );
      }
    });
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
  }
}
