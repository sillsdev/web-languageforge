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
  getAvatarUrl = UtilityService.getAvatarUrl;
  unread: string[] = [];
  filteredActivities: Activity[] = [];
  activities: Activity[] = [];
  showAllActivity: boolean = true;

  static $inject = ['$sce', 'activityService',
    'breadcrumbService', 'linkService',
    'sessionService'];
  constructor(private $sce: angular.ISCEService, private activityService: ActivityService,
              private breadcrumbService: BreadcrumbService, private linkService: LinkService,
              private sessionService: SessionService) { }

  $onInit(): void {
    this.breadcrumbService.set('top', [
      { label: 'Activity' }
    ]);

    this.activityService.listActivity(result => {
      if (result.ok) {
        this.activities = [];
        this.unread = result.data.unread;
        for (const key in result.data.activity) {
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
  }

  decodeActivityList(items: Activity[]) {
    for (const item of items) {
      if ('userRef' in item) {
        item.userHref = this.linkService.user(item.userRef.id);
      }

      if ('userRef2' in item) {
        item.userHref2 = this.linkService.user(item.userRef2.id);
      }

      if ('projectRef' in item) {
        item.projectHref =
          this.linkService.project(item.projectRef.id, item.projectRef.type);
      }

      if ('textRef' in item) {
        item.textHref = this.linkService.text(item.textRef, item.projectRef.id);
      }

      if ('questionRef' in item) {
        item.questionHref = this.linkService.question(item.textRef,
          item.questionRef, item.projectRef.id);
      }

      if ('entryRef' in item) {
        item.entryHref = this.linkService.entry(item.entryRef, item.projectRef.id);
      }

      if ('content' in item) {
        if ('answer' in item.content) {
          item.content.answer = this.$sce.trustAsHtml(item.content.answer);
        }
      }
    }
  }

  filterAllActivity() {
    this.showAllActivity = true;
    this.filteredActivities = this.activities;
  }

  filterMyActivity() {
    this.sessionService.getSession().then(session => {
      this.showAllActivity = false;
      this.filteredActivities = [];
      for (const activity of this.activities) {
        if (activity.userRef && activity.userRef.id === session.userId() ||
          activity.userRef2 && activity.userRef2.id === session.userId()
        ) {
          this.filteredActivities.push(activity);
        }
      }
    });
  }

}

export const ActivityAppComponent: angular.IComponentOptions = {
  controller: ActivityAppController,
  templateUrl: '/angular-app/bellows/apps/activity/activity-app.component.html'
};
