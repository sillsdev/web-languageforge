import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { nameof } from '@xforge-common/utils';
import { SFProject } from '../core/models/sfproject';
import { Text } from '../core/models/text';
import { SFProjectService } from '../core/sfproject.service';

interface Option {
  id: string;
  name: string;
}

interface ProjectOption extends Option {
  texts: Option[];
}

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent extends SubscriptionDisposable implements OnInit {
  @HostBinding('class') classes = 'flex-column flex-grow';
  selectTextForm = new FormGroup({
    project: new FormControl(null),
    text: new FormControl(null)
  });
  projects$: Observable<ProjectOption[]>;
  selectedProject: ProjectOption = null;
  selectedText: Option = null;

  constructor(private readonly projectService: SFProjectService) {
    super();
  }

  ngOnInit() {
    this.projects$ = this.projectService.getAll({ }, [nameof<SFProject>('texts')]).pipe(map(r => {
      return r.results.map(p => ({
        id: p.id,
        name: p.projectName,
        texts: r.getManyIncluded<Text>(p.texts).map(t => ({ id: t.id, name: t.name }))
      }));
    }));
    this.subscribe(this.selectTextForm.get('project').valueChanges, (project: ProjectOption) => {
      this.selectTextForm.get('text').reset();
      this.selectedProject = project;
    });

    this.subscribe(this.selectTextForm.get('text').valueChanges, (text: Option) => {
      this.selectedText = text;
    });
  }

  compareOption(x: Option, y: Option): boolean {
    return x && y ? x.id === y.id : x === y;
  }
}
