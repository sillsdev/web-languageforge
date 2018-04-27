import { ApiService, JsonRpcCallback } from '../../../bellows/core/api/api.service';
import { ApplicationHeaderService } from '../../../bellows/core/application-header.service';
import { BreadcrumbService } from '../../../bellows/core/breadcrumbs/breadcrumb.service';
import { SessionService } from '../../../bellows/core/session.service';
import { LexiconLinkService } from './lexicon-link.service';

export class LexiconProjectService {
  static $inject: string[] = ['apiService', 'sessionService',
    'breadcrumbService',
    'lexLinkService',
    'applicationHeaderService'
  ];
  constructor(private api: ApiService, private sessionService: SessionService,
              private breadcrumbService: BreadcrumbService,
              private linkService: LexiconLinkService,
              private applicationHeaderService: ApplicationHeaderService) { }

  setBreadcrumbs(view: string, label: string, forceRefresh: boolean = false): void {
    this.sessionService.getSession(forceRefresh).then(session => {
      this.breadcrumbService.set('top', [{
        href: '/app/projects',
        label: 'My Projects'
      }, {
        href: this.linkService.projectUrl(),
        label: session.project().projectName
      }, {
        href: this.linkService.projectView(view),
        label
      }]);
    });
  }

  baseViewDto(view: string, label: string, callback: JsonRpcCallback) {
    this.api.call('lex_baseViewDto', [], result => {
      if (result.ok) {
        this.setBreadcrumbs(view, label);
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

  updateSettings(smsSettings: any, emailSettings: any, callback?: JsonRpcCallback) {
    return this.api.call('project_updateSettings', [smsSettings, emailSettings], callback);
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
