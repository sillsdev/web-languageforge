import * as angular from 'angular';

import { ApiMethod } from '../../../bellows/core/api/api.service';
import { ProjectService } from '../../../bellows/core/api/project.service';

export class TranslateProjectService extends ProjectService {
  readProject: ApiMethod;
  updateConfig: ApiMethod;
  users: ApiMethod;
  updateUserProfile: ApiMethod;
  getProjectId: () => string;
  updateDocumentSet: ApiMethod;
  listDocumentSetsDto: ApiMethod;
  removeDocumentSet: ApiMethod;

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService) {
    super($injector);
    this.readProject = this.api.method('translate_projectDto');
    this.updateConfig = this.api.method('translate_configUpdate');
    this.users = this.api.method('project_usersDto');
    this.updateUserProfile = this.api.method('user_updateProfile');
    this.getProjectId = this.sessionService.projectId;
    this.updateDocumentSet = this.api.method('translate_documentSetUpdate');
    this.listDocumentSetsDto = this.api.method('translate_documentSetListDto');
    this.removeDocumentSet = this.api.method('translate_documentSetRemove');
  }

  updateProject(projectData: any) {
    return this.api.call('translate_projectUpdate', [projectData]);
  }

  updateUserPreferences(userPreferences: any) {
    return this.api.call('translate_configUpdateUserPreferences', [userPreferences]);
  }

  isValidProjectCode(code: string): boolean {
    if (angular.isUndefined(code)) return false;

    // Valid project codes start with a letter and only contain lower-case letters, numbers,
    // dashes and underscores
    const pattern = /^[a-z][a-z0-9\-_]*$/;
    return pattern.test(code);
  };
}
