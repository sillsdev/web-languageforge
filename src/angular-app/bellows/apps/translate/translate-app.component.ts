import * as angular from 'angular';

import { SiteWideNoticeService } from '../../core/site-wide-notice-service';
import { SessionService } from '../../core/session.service';
import { TranslateProjectService } from './core/translate-project.service';
import { TranslateRights, TranslateRightsService } from './core/translate-rights.service';
import { TranslateSendReceiveService } from './core/translate-send-receive.service';
import { TranslateConfig } from './shared/model/translate-config.model';
import { TranslateProject } from './shared/model/translate-project.model';

export class TranslateAppController implements angular.IController {
  project: TranslateProject;
  rights: TranslateRights;
  interfaceConfig: any;

  static $inject = ['$state', 'sessionService',
    'siteWideNoticeService',
    'translateRightsService',
    'translateProjectApi', '$q'
  ];
  constructor(private $state: angular.ui.IStateService, private sessionService: SessionService,
              private siteWideNoticeService: SiteWideNoticeService,
              private rightsService: TranslateRightsService,
              private projectApi: TranslateProjectService, private $q: angular.IQService) {}

  $onInit() {
    this.$q.all([this.rightsService.getRights(), this.sessionService.getSession(),
      this.projectApi.readProject()
    ]).then(([rights, session, readProjectResult]) => {
      this.rights = rights;

      const project = session.project<TranslateProject>();
      if (readProjectResult.ok) {
        angular.merge(project, readProjectResult.data.project);
      }

      project.config = project.config || new TranslateConfig();
      this.project = project;

      // this.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
      this.interfaceConfig = {};
      this.interfaceConfig.direction = 'ltr';
      this.interfaceConfig.pullToSide = 'float-right';
      this.interfaceConfig.pullNormal = 'float-left';
      this.interfaceConfig.placementToSide = 'left';
      this.interfaceConfig.placementNormal = 'right';
    });
    this.siteWideNoticeService.displayNotices();
  }

  get showSync(): boolean {
    if (this.project == null || this.rights == null || this.project.config == null ||
        this.project.config.source == null || this.project.config.source.paratextProject == null) {
      return false;
    }
    return this.project.config.source.paratextProject.id != null && !this.project.isArchived &&
      this.rights.canEditUsers();
  }

  get showSettingsDropdown(): boolean {
    return this.rights != null && (this.rights.canEditProject() || this.rights.canEditUsers());
  }

  gotoTranslation() {
    this.$state.go('editor');
  }

  showTranslationButton() {
    return !this.$state.is('editor');
  }

  // noinspection JSUnusedGlobalSymbols
  onUpdateProject($event: { project: any }) {
    this.project = $event.project;
  }
}

export const TranslateAppComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/bellows/apps/translate/translate-app.component.html',
  controller: TranslateAppController
};
