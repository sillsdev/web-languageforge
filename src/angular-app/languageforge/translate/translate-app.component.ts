import * as angular from 'angular';

import { SessionService } from '../../bellows/core/session.service';
import { TranslateProjectService } from './core/translate-project.service';
import { Rights, TranslateRightsService } from './core/translate-rights.service';

export class TranslateAppController implements angular.IController {
  project: any;
  rights: Rights;
  interfaceConfig: any;

  static $inject = ['$state', 'sessionService',
    'translateRightsService',
    'translateProjectApi', '$q'
  ];
  constructor(private $state: angular.ui.IStateService, private sessionService: SessionService,
              private rightsService: TranslateRightsService,
              private projectApi: TranslateProjectService, private $q: angular.IQService) {}

  $onInit() {
    this.$q.all([this.rightsService.getRights(), this.sessionService.getSession(),
      this.projectApi.readProject()
    ]).then(([rights, session, readProjectResult]) => {
      this.rights = rights;
      this.rights.showSettingsDropdown = () => {
        return this.rights.canEditProject() || this.rights.canEditUsers() ||
          this.rights.canEditEntry();
      };

      this.project = session.project();
      if (readProjectResult.ok) {
        angular.merge(this.project, readProjectResult.data.project);
      }

      this.project.config = this.project.config || {};

      // this.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
      this.interfaceConfig = {};
      this.interfaceConfig.direction = 'ltr';
      this.interfaceConfig.pullToSide = 'pull-right';
      this.interfaceConfig.pullNormal = 'pull-left';
      this.interfaceConfig.placementToSide = 'left';
      this.interfaceConfig.placementNormal = 'right';
    });
  }

  gotoTranslation() {
    this.$state.go('editor');
  }

  showTranslationButton() {
    return !this.$state.is('editor');
  }

  onUpdateProject($event: { project: any }) {
    this.project = $event.project;
  }

}

export const TranslateAppComponent: angular.IComponentOptions = {
  templateUrl: '/angular-app/languageforge/translate/translate-app.component.html',
  controller: TranslateAppController
};
