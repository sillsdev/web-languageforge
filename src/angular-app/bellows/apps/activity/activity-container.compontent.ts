import * as angular from 'angular';

import {ActivityService, FilterParams} from '../../core/api/activity.service';
import {JsonRpcResult} from '../../core/api/json-rpc.service';
import {LinkService} from '../../core/link.service';
import {SessionService} from '../../core/session.service';
import {UtilityService} from '../../core/utility.service';
import {Project} from '../../shared/model/project.model';
import {User} from '../../shared/model/user.model';
import {FieldControl} from "../../../languageforge/lexicon/editor/field/field-control.model";

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
  userGroups: ActivityUserGroup[] = [];
  showActivities: boolean = false;

  constructor(public name: string, public date: Date, public dateFormat: string = 'h:mma d/MM/yy') {
    date.setHours(0, 0, 0, 0);
    this.date = new Date(date);
  }
}

class ActivityUserGroup {
  activities: Activity[] = [];
  unread: number = 0;
  user: User;
  date: Date;

  constructor(private activity: Activity) {
    this.user = activity.userRef;
    this.date = activity.date;
  }
}

class ActivityType {
  constructor(public action: string, public type: string, public label: string, public icon: string) { }
}

class FilterUser {
  id: string;
  username: string;
}

export class ActivityContainerController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  activities: Activity[] = [];
  activityGroups: ActivityGroup[] = [];
  activityTypes: ActivityType[] = [];
  filterDateOpen: boolean = false;
  filterDateToday: Date = new Date();
  filteredActivities: Activity[] = [];
  filterUsers: FilterUser[] = [];
  unread: string[] = [];
  entryId: string;
  filterParams: FilterParams = new FilterParams();
  filterDate: string;
  filterDateMin: Date;
  filterDateMax: Date;
  loadingFeed: boolean;
  filterStartDate: any;
  filterUser: FilterUser;
  filterEndDate: any;
  filterType: ActivityType;

  static $inject = ['$sce', '$scope',
    'activityService', 'linkService',
    'sessionService'];
  constructor(private $sce: angular.ISCEService, private $scope: angular.IScope,
              private activityService: ActivityService, private linkService: LinkService,
              private sessionService: SessionService) {
    // Set activity groups up
    const today = new Date();
    let newDate = today;
    this.activityGroups.push(new ActivityGroup('Today', today, 'h:mma \'Today\''));
    newDate.setDate(today.getDate() - 1);
    this.activityGroups.push(new ActivityGroup('Yesterday', newDate, 'h:mma \'Yesterday\''));
    newDate = new Date();
    newDate.setDate(today.getDate() - 6);
    this.activityGroups.push(new ActivityGroup('Last week', newDate, 'h:mma EEEE'));
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
      'New comment',
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
      'Comment status changed',
      'pencil-square'));
    this.activityTypes.push(new ActivityType(
      'add_comment',
      'project',
      'New Comment',
      'reply'));
    this.activityTypes.push(new ActivityType(
      'update_comment',
      'project',
      'Update Comment',
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
    // TODO: Move all definitions into the API so we get everything we need returned
    this.activityService.validActivityTypes().then(result => {
      if (result.ok) {
        // Loop through valid activity types and remove what isn't needed
        for (const index in this.activityTypes) {
          if (this.activityTypes.hasOwnProperty(index)) {
            let activityFound = false;
            for (const activityType of result.data) {
              if (activityType === this.activityTypes[index].type) {
                activityFound = true;
                break;
              }
            }
            if (!activityFound) {
              this.activityTypes.splice(parseInt(index, 10), 1);
            }
          }
        }
      }
    });
  }

  $onInit(): void {
    // Example of showing all activities between two dates:
    // var now = new Date();
    // var lastWeek = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 7);    //  7 days in milliseconds
    // var lastMonth = new Date(now.valueOf() - 1000 * 60 * 60 * 24 * 30);  // 30 days in milliseconds
    // this.activityService.listActivity({startDate: lastMonth, endDate: lastWeek}, result => { ... });

    this.loadingFeed = false;
    this.loadActivityFeed();

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
            if (this.isUnread(activity.id)) {
              userGroup.unread++;
            }
          }
      }
        previousDate = activityGroup.date;
      }
    }, true);
  }

  $onChanges(changes: any): void {
    if (changes.entryId.currentValue) {
      this.entryId = changes.entryId.currentValue;
      this.loadActivityFeed(true);
    }
  }

  loadActivityFeed(reset: boolean = false) {
    if (reset) {
      this.activities = [];
      this.filterParams.skip = 0;
    }
    // Set date label
    this.filterDate = '';
    this.filterDateMin = new Date();
    this.filterDateMin.setMonth(this.filterDateMin.getMonth() - 1);
    this.filterDateMax = new Date();
    if (this.filterParams.startDate === null && this.filterParams.endDate === null) {
      this.filterDate = 'From Beginning';
    } else {
      if (this.filterParams.startDate !== null) {
        this.filterDate += this.filterStartDate.format('MMM D, YYYY');
        this.filterDateMin = this.filterParams.startDate;
      } else {
        this.filterDate += 'From Beginning';
      }
      this.filterDate += ' to ';
      if (this.filterParams.endDate !== null) {
        this.filterDate += this.filterEndDate.format('MMM D, YYYY');
        this.filterDateMax = this.filterParams.endDate;
      } else {
        this.filterDate += 'Now';
      }
    }
    // Choose appropriate API end point
    if (angular.isDefined(this.entryId)) {
      if (this.entryId && !this.entryId.startsWith('_new_')) {
        this.activities = [];
        this.filterParams.skip = 0;
        this.loadingFeed = true;
        this.activityService.listActivityForLexicalEntry(this.entryId, this.filterParams, result => {
          this.processActivityListFeed(result);
        });
      }
    } else {
      this.loadingFeed = true;
      this.activityService.listActivity(this.filterParams, result => {
        this.processActivityListFeed(result);
      });
    }
  }

  loadMoreActivities() {
    this.filterParams.skip += this.filterParams.limit;
    this.loadActivityFeed();
  }

  processActivityListFeed(result: JsonRpcResult) {
    this.loadingFeed = false;
    if (result.ok) {
      // Prepare the activities
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
      this.activityService.setUnreadCount(this.getUnreadCount());
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
    this.activityService.setUnreadCount(this.getUnreadCount());
  }

  filterByUser() {
    if (!this.filterUser) return;
    const filteredActivities = [];
    for (const activity of this.activities) {
      if (activity.userRef && activity.userRef.id === this.filterUser.id) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  filterByType() {
    if (!this.filterType) return;
    const filteredActivities = [];
    for (const activity of this.filteredActivities) {
      if (activity.action === this.filterType.action && activity.type === this.filterType.type) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  filterByDate() {
    if (angular.isDefined(this.filterStartDate) && this.filterStartDate !== true) {
      this.filterParams.startDate = this.filterStartDate._d;
    } else {
      this.filterParams.startDate = null;
    }
    if (angular.isDefined(this.filterEndDate) && this.filterEndDate !== true) {
      this.filterParams.endDate = this.filterEndDate._d;
    } else {
      this.filterParams.endDate = null;
    }
    this.loadActivityFeed(true);
  }

  buildUsersList() {
    this.sessionService.getSession().then(session => {
      this.filterUsers = [];
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

  getUnreadCount() {
    let unread = 0;
    for (const activity of this.filteredActivities) {
      if (this.isUnread(activity.id)) {
        unread++;
      }
    }
    return unread;
  }
}

export const ActivityContainerComponent: angular.IComponentOptions = {
  controller: ActivityContainerController,
  templateUrl: '/angular-app/bellows/apps/activity/activity-container.component.html',
  bindings: {
    entryId: '@?'
  }
};
