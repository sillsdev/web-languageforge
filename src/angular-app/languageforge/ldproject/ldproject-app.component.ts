import * as angular from 'angular';

import {SiteWideNoticeService} from '../../bellows/core/site-wide-notice-service';
import {HelpHeroService} from '../../bellows/core/helphero.service';
import {NoticeService} from '../../bellows/core/notice/notice.service';
import {InterfaceConfig} from '../../bellows/shared/model/interface-config.model';
import {User} from '../../bellows/shared/model/user.model';
import { ProjectService } from '../../bellows/core/api/project.service';
import { LdapiProjectInfo } from '../../bellows/apps/siteadmin/ldapi-projects-view';
import { UserService } from '../../bellows/core/api/user.service';
import { LdapiUserInfo } from '../../bellows/apps/siteadmin/ldapi-users-view';

// TODO: siteadmin LDAPI projects component is very similar, only differing in a few things like
// "Can we search for users" and "how do we add users: directly, or via an invite email"?
// But also, the "Invite a friend" dialog is very similar, too.

export interface LdapiProjectDto {
  code: string;
  description: string;
  name: string;
  membership: [LdapiUserInfo, string][];
}

export class LdProjectAppController implements angular.IController {
  finishedLoading: boolean = false;
  interfaceConfig: InterfaceConfig = {} as InterfaceConfig;
  users: { [userId: string]: User } = {};
  project: LdapiProjectDto = undefined;
  projectId: string = "";
  membership: [LdapiUserInfo, string][] = [];

  private online: boolean;
  private pristineLanguageCode: string;

  static $inject = ['$scope', '$location',
    '$q',
    'silNoticeService',
    'projectService',
    'userService',
    'siteWideNoticeService',
    ];
  constructor(private readonly $scope: angular.IScope, private readonly $location: angular.ILocationService,
              private readonly $q: angular.IQService,
              private readonly notice: NoticeService,
              private readonly projectService: ProjectService,
              private readonly userService: UserService,
              private readonly siteWideNoticeService: SiteWideNoticeService,
              ) { }

  $onInit(): void {
    var match = this.$location.path().match(/\/app\/ldproject\/([^\/]+)/);
    console.log(match);
    if (match.length > 1) {
      this.projectId = match[1];
      this.projectService.getLdapiProjectDto(this.projectId).then(result => {
        console.log("Project DTO result:", result);
        if (result.ok) {
          this.project = result.data;
          console.log("Found project", this.project);
          this.membership = this.project.membership;
          console.log("Project membership to display:", this.membership);
        }
      });
    }
  }

  $onDestroy(): void {
  }

  onUpdate = (
    $event: {
      foo?: string,
    }
  ): void => {
    if ($event.foo) {
    }
  }
}

export const LdProjectAppComponent: angular.IComponentOptions = {
  controller: LdProjectAppController,
  templateUrl: '/angular-app/languageforge/ldproject/ldproject-app.component.html'
};
