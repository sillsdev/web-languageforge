import * as angular from 'angular';

import { JsonRpcCallback } from '../../../bellows/core/api/api.service';
import { ProjectService } from '../../../bellows/core/api/project.service';
import { Metrics } from '../editor/metric.service';

export { JsonRpcCallback } from '../../../bellows/core/api/api.service';

export class TranslateProjectService extends ProjectService {
  getProjectId: () => string;

  static $inject: string[] = ['$injector'];
  constructor(protected $injector: angular.auto.IInjectorService) {
    super($injector);
    this.getProjectId = this.sessionService.projectId;
  }

  updateProject(projectData: any, callback?: JsonRpcCallback) {
    return this.api.call('translate_projectUpdate', [projectData], callback);
  }

  readProject(callback?: JsonRpcCallback) {
    return this.api.call('translate_projectDto', [], callback);
  }

  updateConfig(configData: any, callback?: JsonRpcCallback) {
    return this.api.call('translate_configUpdate', [configData], callback);
  }

  updateUserPreferences(userPreferenceData: any, callback?: JsonRpcCallback) {
    return this.api.call('translate_configUpdateUserPreferences', [userPreferenceData], callback);
  }

  updateDocumentSet(documentSetData: any, callback?: JsonRpcCallback) {
    return this.api.call('translate_documentSetUpdate', [documentSetData], callback);
  }

  listDocumentSetsDto(callback?: JsonRpcCallback) {
    return this.api.call('translate_documentSetListDto', [], callback);
  }

  removeDocumentSet(documentId: string, callback?: JsonRpcCallback) {
    return this.api.call('translate_documentSetRemove', [documentId], callback);
  }

  updateMetrics(metricsData: Metrics, documentSetId: string, metricId: string = '', callback?: JsonRpcCallback) {
    return this.api.call('translate_updateMetrics', [metricsData, documentSetId, metricId], callback);
  }

  usxToHtml(usx: string, callback?: JsonRpcCallback) {
    return this.api.call('translate_usxToHtml', [usx], callback);
  }

  updateUserProfile(params: any[] = [], callback?: JsonRpcCallback) {
    return this.api.call('user_updateProfile', params, callback);
  }

  isValidProjectCode(code: string): boolean {
    if (angular.isUndefined(code)) return false;

    // Valid project codes start with a letter and only contain lower-case letters, numbers,
    // dashes and underscores
    const pattern = /^[a-z][a-z0-9\-_]*$/;
    return pattern.test(code);
  }
}
