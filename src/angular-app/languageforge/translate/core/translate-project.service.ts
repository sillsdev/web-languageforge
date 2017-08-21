import * as angular from 'angular';

import { ApiMethod } from  '../../../bellows/core/api.service';
import { ProjectService } from '../../../bellows/core/project.service';

export class TranslateProjectService extends ProjectService {
  updateProject: ApiMethod;
  readProject: ApiMethod;
  updateConfig: ApiMethod;
  updateUserPreferences: ApiMethod;
  users: ApiMethod;
  updateUserProfile: ApiMethod;
  getProjectId: () => string;

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService) {
    super($injector);
    this.updateProject = this.api.method('translate_projectUpdate');
    this.readProject = this.api.method('translate_projectDto');
    this.updateConfig = this.api.method('translate_configUpdate');
    this.updateUserPreferences = this.api.method('translate_configUpdateUserPreferences');
    this.users = this.api.method('project_usersDto');
    this.updateUserProfile = this.api.method('user_updateProfile');
    this.getProjectId = this.sessionService.projectId;
  }

  isValidProjectCode(code: string): boolean {
    if (angular.isUndefined(code)) return false;

    // Valid project codes start with a letter and only contain lower-case letters, numbers,
    // dashes and underscores
    const pattern = /^[a-z][a-z0-9\-_]*$/;
    return pattern.test(code);
  };
}
