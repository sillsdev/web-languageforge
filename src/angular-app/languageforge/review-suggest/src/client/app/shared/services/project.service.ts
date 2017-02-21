import { Injectable } from '@angular/core';

import { LfApiService } from './lf-api.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

@Injectable()

export class ProjectService {
  private projectId: string = null;
  private projectList: any = null;
  private projectSettings: any = null;
  private projectWordList: any = null;

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
    this.projectWordList = this.data.get('current_project_words');
    this.projectList = this.data.get('current_project_list');
  }

  setProjectId(projectId: string) {
    this.data.set('current_project_id', projectId);
    this.projectId = projectId;
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
        this.data.set('current_project_list', response.data);
        this.projectList = response.data;
      } else {
        if (this.projectList != null) {
          response.data = this.projectList;
          response.success = true;
        }
      }
      return response;
    });
  }

  getSelectedProjectWordList() {
    return this.getProjectWordList(this.projectId).map(response => {
      if (!response.success) {
        if (this.projectWordList != null) {
          response.data = this.projectWordList;
          response.success = true;
        }
      }
      return response;
    });
  }

  private getProjectWordList(projectId: string) {
    return this.lfApiService.lex_dbeDtoFull_by_id(projectId).map(response => {
      if (response.success) {
        this.data.set('current_project_words', response.data);
        this.projectWordList = response.data;
      }
      return response;
    });
  }
  
  getSelectedProjectSettings() {
    return this.getProjectSettings(this.projectId).map(response => {
      if (!response.success) {
        if (this.projectSettings != null) {
          response.data = this.projectSettings;
          response.success = true;
        }
      }
      return response;
    });
  }

  private getProjectSettings(projectId: string) {
    return this.lfApiService.project_read_by_id(projectId).map(response => {
      if (response.success) {
        this.data.set('current_project_settings', response.data);
        this.projectSettings = response.data;
      }
      return response;
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