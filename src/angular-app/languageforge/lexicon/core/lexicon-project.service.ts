import * as angular from 'angular';

import {ApiService, JsonRpcCallback} from '../../../bellows/core/api/api.service';
import {ApplicationHeaderService, HeaderSetting} from '../../../bellows/core/application-header.service';
import {BreadcrumbService} from '../../../bellows/core/breadcrumbs/breadcrumb.service';
import {SessionService} from '../../../bellows/core/session.service';
import {LexiconProjectSettings} from '../shared/model/lexicon-project-settings.model';
import {LexiconProject} from '../shared/model/lexicon-project.model';
import {LexiconLinkService} from './lexicon-link.service';
import {LexiconRightsService} from './lexicon-rights.service';

export class LexiconProjectService {
  static $inject: string[] = ['$q', 'apiService', 'sessionService',
    'breadcrumbService',
    'lexLinkService',
    'applicationHeaderService',
    'lexRightsService'
  ];
  constructor(private $q: angular.IQService, private api: ApiService, private sessionService: SessionService,
              private breadcrumbService: BreadcrumbService,
              private linkService: LexiconLinkService,
              private applicationHeaderService: ApplicationHeaderService,
              private rightsService: LexiconRightsService) { }

  setBreadcrumbs(view: string, label: string, forceRefresh: boolean = false): void {
    this.sessionService.getSession(forceRefresh).then(session => {
      this.breadcrumbService.set('top', [{
        href: '/app/projects',
        label: 'My Projects'
      }, {
        href: `/projects/${session.project<LexiconProject>().projectCode}`,
        label: session.project<LexiconProject>().projectName
      }, {
        href: this.linkService.projectView(view),
        label
      }]);
    });
  }

  setupSettings(): void {
    this.rightsService.getRights().then(rights => {
      const settings = [];
      if (rights.canEditProject()) {
        settings.push(new HeaderSetting(
          'dropdown-configuration',
          'Configuration',
          this.linkService.projectUrl() + 'configuration'
        ));
        settings.push(new HeaderSetting(
          'dropdown-import-data',
          'Import Data',
          this.linkService.projectUrl() + 'importExport'
        ));
        settings.push(new HeaderSetting(
          'userManagementLink',
          'Share With Others',
          '#',
          false
        ));
        settings.push(new HeaderSetting(
          'dropdown-project-settings',
          'Project Settings',
          this.linkService.projectUrl() + 'settings'
        ));
        if (!rights.session.project<LexiconProject>().isArchived &&
          rights.session.projectSettings<LexiconProjectSettings>().hasSendReceive
        ) {
          settings.push(new HeaderSetting(
            'dropdown-synchronize',
            'Synchronize',
            this.linkService.projectUrl() + 'sync',
            true
          ));
        }
      }
      this.applicationHeaderService.setSettings(settings);
    });
  }

  baseViewDto(view: string, label: string, callback: JsonRpcCallback) {
    this.api.call('lex_baseViewDto', [], result => {
      if (result.ok) {
        this.setBreadcrumbs(view, label);
        this.setupSettings();
      }

      callback(result);
    });
  }

  updateConfiguration(config: any, optionlists: any, callback?: JsonRpcCallback) {
    return this.api.call('lex_configuration_update', [config, optionlists], callback);
  }

  readProject(callback?: JsonRpcCallback) {
    return this.api.call('lex_projectDto', [], callback);
  }

  updateProject(settings: any, callback?: JsonRpcCallback) {
    return this.api.call('lex_project_update', [settings], callback);
  }

  readSettings(callback?: JsonRpcCallback) {
    return this.api.call('project_readSettings', [], callback);
  }

  users(callback?: JsonRpcCallback) {
    return this.api.call('project_usersDto', [], callback);
  }

  updateUserProfile(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_updateProfile', [params], callback);
  }

  removeMediaFile(mediaType: any, filename: any, callback?: JsonRpcCallback) {
    return this.api.call('lex_project_removeMediaFile', [mediaType, filename], callback);
  }

  static isValidProjectCode(code: string): boolean {
    if (code == null) {
      return false;
    }

    // Valid project codes start with a letter and only contain lower-case letters, numbers,
    // dashes and underscores
    const pattern = /^[a-z][a-z0-9\-_]*$/;
    return pattern.test(code);
  }
}
