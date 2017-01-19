import { Injectable } from '@angular/core';

import { LfApiService } from './lf-api.service';

@Injectable()

export class ProjectService {
  private projectId: string = null;
  private projectSettings: any = null;

  private data = {
    set: function(key: any, value: any) {
      if (!key || !value) { return; }

      if (typeof value === "object") {
        value = JSON.stringify(value);
      }
      localStorage.setItem(key, value);
    },
    get: function(key: any) {
      var value = localStorage.getItem(key);

      if (!value) { return ""; }

      // assume it is an object that has been stringified
      if (value[0] === "{") {
        value = JSON.parse(value);
      }
      return value;
    }
  };

  constructor(private lfApiService: LfApiService) {
    this.projectId = this.data.get('current_project_id');
    this.projectSettings = this.data.get('current_project_settings');
  }

  setProjectId(projectId: string) {
    this.data.set('current_project_id', projectId);
    this.projectId = projectId;
    this.getProjectSettings(projectId).subscribe(response => {
      this.projectSettings = response;
    })
  }

  getProjectId() {
    return this.projectId;
  }

  isProjectSelected() {
    return !!this.projectId;
  }

  getProjectList() {
    return this.lfApiService.project_list().map(response => {
      if (response.success) {
        this.data.set('current_project_list', response.data.entries);
      }
      return response.data;
    });
  }

  getWordList(id: string) {
    return this.lfApiService.lex_dbeDtoFull_by_id(id).map(response => {
      if (response.success) {
        this.data.set('current_project_words', response.data.entries);
      }
      return response.data;
    });
  }
  
  getSelectedProjectSettings() {
    return this.projectSettings;
  }

  private getProjectSettings(projectId: string) {
    return this.lfApiService.project_read_by_id(projectId).map(response => {
      if (response.success) {
        this.data.set('current_project_settings', response.data);
      }
      return response.data;
    });
  }

  logout() {
    localStorage.removeItem('current_project_id');
    localStorage.removeItem('current_project_list');
    localStorage.removeItem('current_project_words');
    localStorage.removeItem('current_project_settings');
    this.projectId = null;
  }
}