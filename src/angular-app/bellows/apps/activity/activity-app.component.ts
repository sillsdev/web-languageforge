import * as angular from 'angular';

import { ActivityService } from '../../core/api/activity.service';
import { BreadcrumbService } from '../../core/breadcrumbs/breadcrumb.service';
import { LinkService } from '../../core/link.service';
import { SessionService } from '../../core/session.service';
import { UtilityService } from '../../core/utility.service';
import { Project } from '../../shared/model/project.model';
import { User } from '../../shared/model/user.model';

class Activity {
  action: string;
  content: any;
  date: string;
  dateCreated: string;
  dateModified: string;
  entryRef: any;
  entryHref: string;
  id: string;
  projectRef: Project;
  projectHref: string;
  questionRef: any;
  questionHref: string;
  textRef: any;
  textHref: string;
  type: string;
  userRef: User;
  userHref: string;
  userRef2: User;
  userHref2: string;
}

export class ActivityAppController implements angular.IController {
  getAvatarUrl = this.util.getAvatarUrl;
  unread: string[] = [];
  filteredActivities: Activity[] = [];
  activities: Activity[] = [];
  showAllActivity: boolean = true;

  static $inject = ['$sce', 'activityService',
    'breadcrumbService', 'linkService',
    'sessionService', 'utilService'];
  constructor(private $sce: angular.ISCEService, private activityService: ActivityService,
              private breadcrumbService: BreadcrumbService, private linkService: LinkService,
              private sessionService: SessionService, private util: UtilityService) { }

  $onInit(): void {
    this.breadcrumbService.set('top', [
      { label: 'Activity' }
    ]);

    this.activityService.listActivity((result) => {
      if (result.ok) {
        this.activities = [];
        this.unread = result.data.unread;
        for (let key in result.data.activity) {
          if (result.data.activity.hasOwnProperty(key)) {
            this.activities.push(result.data.activity[key]);
          }
        }

        this.decodeActivityList(this.activities);
        this.filteredActivities = this.activities;
      }
    });

  }

  isUnread(id: string) {
    return (this.unread.findIndex(value => value === id) > -1);
  };

  decodeActivityList(items: Activity[]) {
    for (let i = 0; i < items.length; i++) {
      if ('userRef' in items[i]) {
        items[i].userHref = this.linkService.user(items[i].userRef.id);
      }

      if ('userRef2' in items[i]) {
        items[i].userHref2 = this.linkService.user(items[i].userRef2.id);
      }

      if ('projectRef' in items[i]) {
        items[i].projectHref =
          this.linkService.project(items[i].projectRef.id, items[i].projectRef.type);
      }

      if ('textRef' in items[i]) {
        items[i].textHref = this.linkService.text(items[i].textRef, items[i].projectRef.id);
      }

      if ('questionRef' in items[i]) {
        items[i].questionHref = this.linkService.question(items[i].textRef,
          items[i].questionRef, items[i].projectRef.id);
      }

      if ('entryRef' in items[i]) {
        items[i].entryHref = this.linkService.entry(items[i].entryRef, items[i].projectRef.id);
      }

      if ('content' in items[i]) {
        if ('answer' in items[i].content) {
          items[i].content.answer = this.$sce.trustAsHtml(items[i].content.answer);
        }

      }
    }
  };

  filterAllActivity() {
    this.showAllActivity = true;
    this.filteredActivities = this.activities;
  };

  filterMyActivity() {
    this.sessionService.getSession().then((session) => {
      this.showAllActivity = false;
      this.filteredActivities = [];
      for (let activity of this.activities) {
        if (activity.userRef && activity.userRef.id === session.userId() ||
          activity.userRef2 && activity.userRef2.id === session.userId()
        ) {
          this.filteredActivities.push(activity);
        }
      }
    });
  };

}

export const ActivityAppComponent: angular.IComponentOptions = {
  controller: ActivityAppController,
  templateUrl: '/angular-app/bellows/apps/activity/activity-app.component.html'
};
