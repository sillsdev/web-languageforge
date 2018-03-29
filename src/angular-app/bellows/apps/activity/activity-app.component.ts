import * as angular from 'angular';

import {ActivityService} from '../../core/api/activity.service';
import {JsonRpcResult} from '../../core/api/json-rpc.service';
import {BreadcrumbService} from '../../core/breadcrumbs/breadcrumb.service';
import {LinkService} from '../../core/link.service';
import {SessionService} from '../../core/session.service';
import {UtilityService} from '../../core/utility.service';
import {Project} from '../../shared/model/project.model';
import {User} from '../../shared/model/user.model';

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
  icon: string;
}

class ActivityGroup {
  name: string;
  date: Date;
  dateFormat: string;
  userGroups: ActivityUserGroup[];
  showActivities: boolean;

  constructor(private $name: string, private $date: Date, private $dateFormat: string = 'h:mma d/MM/yy') {
    this.name = $name;
    $date.setHours(0, 0, 0, 0);
    this.date = new Date($date);
    this.dateFormat = $dateFormat;
    this.userGroups = [];
    this.showActivities = false;
  }
}

class ActivityUserGroup {
  user: User;
  date: Date;
  activities: Activity[];

  constructor(private activity: Activity) {
    this.user = activity.userRef;
    this.date = activity.date;
    this.activities = [];
  }
}

class ActivityType {
  type: string;
  action: string;
  label: string;
  icon: string;

  constructor(private $action: string, private $type: string, private $label: string, private $icon: string) {
    this.type = $type;
    this.action = $action;
    this.label = $label;
    this.icon = $icon;
  }
}

class FilterUsers {
  id: string;
  username: string;
}

export class ActivityAppController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  unread: string[] = [];
  filteredActivities: Activity[] = [];
  activities: Activity[] = [];
  activityGroups: ActivityGroup[];
  activityTypes: ActivityType[];
  filterUsers: FilterUsers[] = [];
  entryId: string;

  static $inject = ['$sce', 'activityService',
    'breadcrumbService', 'linkService',
    'sessionService', '$scope'];

  constructor(private $sce: angular.ISCEService, private activityService: ActivityService,
              private breadcrumbService: BreadcrumbService, private linkService: LinkService,
              private sessionService: SessionService, private $scope: any) {
    this.activityGroups = [];
    this.activityTypes = [];
    this.filterUsers = [];
  }

  $onInit(): void {
    this.breadcrumbService.set('top', [
      {label: 'Activity'}
    ]);

    // Example of showing all activities between two dates:
    // var now = new Date();
    // var lastWeek = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7);    //  7 days in milliseconds
    // var lastMonth = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 30);  // 30 days in milliseconds
    // this.activityService.listActivity({startDate: lastMonth, endDate: lastWeek}, result => { ... });
    const filterParams = {};
    if (angular.isDefined(this.entryId)) {
      // Need to wait for entry promises to resolve before this becomes available
      this.$scope.$watch(() => this.entryId, () => {
        if (this.entryId) {
          this.activityService.listActivityForLexicalEntry(this.entryId, filterParams, result => {
            this.processActivityListFeed(result);
          });
        }
      });
    } else {
      this.activityService.listActivity(filterParams, result => {
        this.processActivityListFeed(result);
      });
    }

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

  processActivityListFeed(result: JsonRpcResult) {
    if (result.ok) {
      // Set activity groups up
      const today = new Date();
      let newDate = today;
      this.activityGroups.push(new ActivityGroup('Today', today, 'h:ma \'Today\''));
      newDate.setDate(today.getDate() - 1);
      this.activityGroups.push(new ActivityGroup('Yesterday', newDate, 'h:ma \'Yesterday\''));
      newDate = new Date();
      newDate.setDate(today.getDate() - 6);
      this.activityGroups.push(new ActivityGroup('Last week', newDate, 'h:ma EEEE'));
      newDate = new Date();
      newDate.setDate(today.getDate() - 13);
      this.activityGroups.push(new ActivityGroup('Two weeks ago', newDate));
      newDate = new Date();
      newDate.setMonth(today.getMonth() - 1);
      this.activityGroups.push(new ActivityGroup('One month ago', newDate));
      newDate = new Date();
      newDate.setFullYear(today.getFullYear() - 10); // 10 years back should be enough to capture everything
      this.activityGroups.push(new ActivityGroup('Older', newDate));
      // Setup activity types
      this.activityTypes.push(new ActivityType(
        'message',
        'global',
        'Global Message',
        'exclamation-triangle'));
      this.activityTypes.push(new ActivityType(
        'add_text',
        'project',
        'New Text',
        'file-text'));
      this.activityTypes.push(new ActivityType(
        'add_user_to_project',
        'project',
        'User added to project',
        'user-plus'));
      this.activityTypes.push(new ActivityType(
        'add_question',
        'project',
        'New question',
        'question-circle'));
      this.activityTypes.push(new ActivityType(
        'add_lex_comment',
        'project',
        'New comment (lexicon)',
        'comments'));
      this.activityTypes.push(new ActivityType(
        'add_entry',
        'project',
        'New Entry',
        'file'));
      this.activityTypes.push(new ActivityType(
        'update_entry',
        'project',
        'Entry Updated',
        'save'));
      this.activityTypes.push(new ActivityType(
        'delete_entry',
        'project',
        'Entry Deleted',
        'trash'));
      this.activityTypes.push(new ActivityType(
        'add_lex_reply',
        'project',
        'Reply to comment',
        'reply'));
      this.activityTypes.push(new ActivityType(
        'update_lex_comment_status',
        'project',
        'Comment status changed (lexicon)',
        'pencil-square'));
      this.activityTypes.push(new ActivityType(
        'add_comment',
        'project',
        'New Comment (SF)',
        'reply'));
      this.activityTypes.push(new ActivityType(
        'update_comment',
        'project',
        'Update Comment (SF)',
        'comments-o'));
      this.activityTypes.push(new ActivityType(
        'add_answer',
        'project',
        'New Answer',
        'comments'));
      this.activityTypes.push(new ActivityType(
        'update_answer',
        'project',
        'Update Answer',
        'comments-o'));
      this.activityTypes.push(new ActivityType(
        'increase_score',
        'project',
        '+1\'d',
        'thumbs-up'));
      // Prepare the activities
      this.activities = [];
      this.unread = result.data.unread;
      for (const key in result.data.activity) {
        if (result.data.activity.hasOwnProperty(key)) {
          // TODO: Update the PHP script to save these in the correct order
          if (result.data.activity[key].userRef2) {
            let tmp;
            tmp = result.data.activity[key].userRef;
            result.data.activity[key].userRef = result.data.activity[key].userRef2;
            result.data.activity[key].userRef2 = tmp;
          }
          this.activities.push(result.data.activity[key]);
        }
      }

      this.decodeActivityList(this.activities);
      this.filteredActivities = this.activities;
      this.buildUsersList();
    }
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

      for (const activityType of this.activityTypes) {
        if (activityType.action === item.action && activityType.type === item.type) {
          item.icon = activityType.icon;
        }
      }
      // Set default icon
      if (!item.icon) {
        item.icon = 'circle';
      }
    }
  }

  triggerFilter() {
    // Reset the filter
    this.filteredActivities = this.activities;
    this.filterByUser();
    this.filterByType();
  }

  filterByUser() {
    if (!this.$scope.filterUser) return;
    const filteredActivities = [];
    for (const activity of this.activities) {
      if (activity.userRef && activity.userRef.id === this.$scope.filterUser.id) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  filterByType() {
    if (!this.$scope.filterType) return;
    const filteredActivities = [];
    for (const activity of this.filteredActivities) {
      if (activity.action === this.$scope.filterType.action && activity.type === this.$scope.filterType.type) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  buildUsersList() {
    this.sessionService.getSession().then(session => {
      this.filterUsers.push({
        id: session.userId(),
        username: 'Me (' + session.username() + ')'
      });
      for (const activity of this.activities) {
        let userExists = false;
        for (const user of this.filterUsers) {
          if (user.id === activity.userRef.id) {
            userExists = true;
            break;
          }
        }
        if (!userExists && activity.userRef.username) {
          this.filterUsers.push({
            id: activity.userRef.id,
            username: activity.userRef.username
          });
        }
      }
    });
  }
}

export const ActivityAppComponent: angular.IComponentOptions = {
  controller: ActivityAppController,
  templateUrl: '/angular-app/bellows/apps/activity/activity-app.component.html',
  bindings: {
    entryId: '@'
  }
};
