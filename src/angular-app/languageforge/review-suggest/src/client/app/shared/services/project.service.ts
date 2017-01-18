import { Injectable } from '@angular/core';
import { Project } from '../models/project';

import { PROJECTS } from '../mock-data/mock-project';

@Injectable()
export class ProjectService {
  getProjects(): Promise<Project[]> {
    return Promise.resolve(PROJECTS);
  }
}