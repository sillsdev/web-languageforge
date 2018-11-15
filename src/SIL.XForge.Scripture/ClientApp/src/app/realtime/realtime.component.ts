import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { nameof } from '@xforge-common/utils';
import { SFProject } from '../core/models/sfproject';
import { Text } from '../core/models/text';
import { SFProjectService } from '../core/sfproject.service';


@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent extends SubscriptionDisposable implements OnInit {
  @HostBinding('class') classes = 'flex-column flex-grow';
  selectTextForm = new FormGroup({
    project: new FormControl(''),
    text: new FormControl('')
  });
  projects$: Observable<SFProject[]>;
  texts: Text[] = [];
  selectedTextId: string = null;

  constructor(private readonly projectService: SFProjectService) {
    super();
  }

  ngOnInit() {
    this.projects$ = this.projectService.getAll({ }, [nameof<SFProject>('texts')]).pipe(map(r => r.results));
    this.subscribe(this.selectTextForm.get('project').valueChanges, (projectId: string) => {
      this.selectTextForm.get('text').reset();
      if (projectId !== '') {
        this.texts = this.projectService.localGetTexts(projectId);
      } else {
        this.texts = [];
      }
    });

    this.subscribe(this.selectTextForm.get('text').valueChanges, (textId: string) => {
      if (textId !== '') {
        this.selectedTextId = textId;
      } else {
        this.selectedTextId = null;
      }
    });
  }
}
