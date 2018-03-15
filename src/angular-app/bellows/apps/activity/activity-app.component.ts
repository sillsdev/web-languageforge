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
  date: Date;
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

export class ActivityGroup {
  name: string;
  date: Date;
  dateFormat: string;
  userGroups: ActivityUserGroup[];
  constructor(private $name: string, private $date: Date, private $dateFormat: string = 'h:mma d/MM/yy') {
    this.name = $name;
    this.date = new Date($date);
    this.dateFormat = $dateFormat;
    this.userGroups = [];
  }
}

export class ActivityUserGroup {
  user: User;
  date: Date;
  activities: Activity[];
  constructor(private activity: Activity) {
    this.user = activity.userRef;
    this.date = activity.date;
    this.activities = [];
  }
}

export class ActivityAppController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  unread: string[] = [];
  filteredActivities: Activity[] = [];
  activities: Activity[] = [];
  activityGroups: ActivityGroup[];
  showAllActivity: boolean = true;

  static $inject = ['$sce', 'activityService',
    'breadcrumbService', 'linkService',
    'sessionService', '$scope'];
  constructor(private $sce: angular.ISCEService, private activityService: ActivityService,
              private breadcrumbService: BreadcrumbService, private linkService: LinkService,
              private sessionService: SessionService, private $scope: any) {
    this.activityGroups = [];
  }

  $onInit(): void {
    this.breadcrumbService.set('top', [
      { label: 'Activity' }
    ]);

    // Example of showing all activities between two dates:
    // var now = new Date();
    // var lastWeek = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7);    //  7 days in milliseconds
    // var lastMonth = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 30);  // 30 days in milliseconds
    // this.activityService.listActivity({startDate: lastMonth, endDate: lastWeek}, result => { ... });
    this.activityService.listActivity({}, result => {
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
        // Set activity groups up
        const today = new Date();
        const newDate = new Date();
        today.setHours(0, 0, 0, 0);
        this.activityGroups.push(new ActivityGroup('Today', today, 'h:ma \'Today\''));
        newDate.setDate(today.getDate() - 1);
        this.activityGroups.push(new ActivityGroup('Yesterday', newDate, 'h:ma \'Yesterday\''));
        newDate.setDate(today.getDate() - 7);
        this.activityGroups.push(new ActivityGroup('Last week', newDate, 'h:ma EEEE'));
        newDate.setDate(today.getDate() - 14);
        this.activityGroups.push(new ActivityGroup('Two weeks ago', newDate));
        newDate.setDate(today.getMonth() - 1);
        this.activityGroups.push(new ActivityGroup('One month ago', newDate));
        newDate.setDate(today.getFullYear() - 100);
        this.activityGroups.push(new ActivityGroup('Older', newDate));
      }
    });

    this.$scope.$watch(() => this.filteredActivities, () => {
      let userGroupIndex;
      let userGroup = new ActivityUserGroup(new Activity());
      let previousDate = new Date();
      for (const activityGroup of this.activityGroups) {
        userGroupIndex = 0;
        activityGroup.userGroups = [];
        for (const activity of this.filteredActivities) {
          if (activity.date > activityGroup.date && activity.date < previousDate) {
            if (angular.isDefined(userGroup.user) && userGroup.user.id !== activity.userRef.id) {
              userGroupIndex++;
            }
            if (!angular.isDefined(activityGroup.userGroups[userGroupIndex])) {
              userGroup = new ActivityUserGroup(activity);
              activityGroup.userGroups[userGroupIndex] = userGroup;
            }
            activityGroup.userGroups[userGroupIndex].activities.push(activity);
          }
        }
        previousDate = activityGroup.date;
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

      if ('date' in item) {
        item.date = new Date(item.date);
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
