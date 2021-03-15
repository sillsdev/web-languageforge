import * as angular from 'angular';

import {ActivityService, FilterParams} from '../../core/api/activity.service';
import {JsonRpcResult} from '../../core/api/json-rpc.service';
import {LinkService} from '../../core/link.service';
import {SessionService} from '../../core/session.service';
import {UtilityService} from '../../core/utility.service';
import {Project} from '../../shared/model/project.model';
import {User} from '../../shared/model/user.model';

class Activity {
  summary: string = '';
  action: string;
  content: {
    project: string,
    entry: string,
    user: string,
    answer: string,
    lexComment: string,
    lexCommentContext: string,
    fieldLabel: FieldLabel,
    changes: ActivityChanges[]
  };
  changes: ActivityChanges;
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
  typeRef: ActivityType;
  userRef: User;
  userHref: string;
  userRefRelated: User;
  userHrefRelated: string;
  icon: string;

  constructor(data: object = {}) {
    if (data != null) {
      for (const property of Object.keys(data)) {
        this[property] = data[property];
      }
    }
  }

  getOldValue() {
    if (this.changes) {
      return Activity.parseValue(this.changes.oldValue);
    } else {
      for (const index in this.content) {
        if (this.content.hasOwnProperty(index)) {
          if (index.startsWith('oldValue')) {
            return Activity.parseValue(this.content[index]);
          }
        }
      }
    }
    return '';
  }

  getNewValue() {
    if (this.changes) {
      return Activity.parseValue(this.changes.newValue);
    } else {
      for (const index in this.content) {
        if (this.content.hasOwnProperty(index)) {
          if (index.startsWith('newValue')) {
            return Activity.parseValue(this.content[index]);
          }
        }
      }
    }
    return '';
  }

  getLabel() {
    if (this.changes) {
      return Activity.formatLabel(this.changes.fieldLabel);
    } else if (this.content.fieldLabel) {
      return Activity.formatLabel(this.content.fieldLabel);
    } else {
      for (const index in this.content) {
        if (this.content.hasOwnProperty(index)) {
          if (index.startsWith('fieldLabel')) {
            let label = this.content[index];
            if (index.includes('#examples')) {
              label = 'Example - ' + label;
            } else if (index.indexOf('#examples')) {
              label = 'Meaning - ' + label;
            }
            return label;
          }
        }
      }
    }
    return 'unknown';
  }

  private static formatLabel(fieldLabel: FieldLabel) {
    let label = fieldLabel.label;
    if (fieldLabel.example) {
      label = 'Example ' + fieldLabel.example + (label !== 'examples' ? ' ' + label : '');
    }
    if (fieldLabel.sense) {
      label = 'Meaning ' + fieldLabel.sense + (label !== 'senses' ? ' ' + label : '');
    }
    return label;
  }

  private static parseValue(value: string) {
    if (value == null) return '';
    if (value.startsWith('[') && value.endsWith(']')) {
      const json = JSON.parse(value);
      value = json.join(', ');
    }
    return value;
  }

}

interface FieldLabel {
  label: string;
  sense?: number;
  example?: number;
}

interface ActivityChanges {
  changeType: string;
  fieldLabel: FieldLabel;
  fieldName: string;
  newValue: string;
  oldValue: string;
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
  showActivities: boolean = false;
  user: User;
  date: Date;

  constructor(private activity: Activity) {
    this.user = activity.userRef;
    this.date = activity.date;
  }

  getSummaryDescription(entryId: string) {
    let summary = '';
    let totalActivityTypes = 0;
    const entryActivities = {};
    const summaryTypes = {};
    for (const activity of this.activities) {
      // Entries are different as multiple updates can be reflected in a single activity
      if (activity.action === 'update_entry') {
        if (!entryActivities.hasOwnProperty(activity.entryRef)) {
          entryActivities[activity.entryRef] = 0;
        }
        entryActivities[activity.entryRef]++;
      } else {
        if (!summaryTypes.hasOwnProperty(activity.action)) {
          summaryTypes[activity.action] = {
            total: 0,
            type: activity.typeRef
          };
          totalActivityTypes++;
        }
        summaryTypes[activity.action].total++;
      }
    }
    if (Object.keys(entryActivities).length) {
      let entryActivityCount = 0;
      let entryActivityItems = 0;
      for (const entryRef of Object.keys(entryActivities)) {
        entryActivityItems += entryActivities[entryRef];
        entryActivityCount++;
      }
      summary += 'updated ' + entryActivityItems + ' field' + (entryActivityItems !== 1 ? 's' : '');
      if (entryId == null) {
        if (entryActivityCount === 1) {
          summary += ' in ' + entryActivityCount + ' entry';
        } else {
          summary += ' across ' + entryActivityCount + ' entries';
        }
      }
      if (totalActivityTypes === 1) {
        summary += ' and ';
      } else if (totalActivityTypes > 1) {
        summary += ', ';
      }
    }
    let count = 1;
    for (const activityAction in summaryTypes) {
      if (summaryTypes.hasOwnProperty(activityAction)) {
        const total = summaryTypes[activityAction].total;
        const type =  summaryTypes[activityAction].type;
        const summaryActivity = (total === 1 ? type.summary : type.summaryPlural);
        summary += summaryActivity.replace('{x}', total);
        if (count === (totalActivityTypes - 1)) {
          summary += ' and ';
        } else if (count < totalActivityTypes) {
          summary += ', ';
        }
        count++;
      }
    }
    return summary;
  }
}

export class ActivityType {
  constructor(public action: string,
              public type: string,
              public label: string,
              public icon: string,
              public summary: string,
              public summaryPlural: string = '') {
    if (this.summaryPlural === '') {
      this.summaryPlural = this.summary + 's';
    }
  }
}

interface FilterUser {
  id: string;
  username: string;
}

export class ActivityContainerController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  activities: Activity[] = [];
  activityGroups: ActivityGroup[] = [];
  activityTypes: ActivityType[] = [];
  filterDateOpen: boolean = false;
  // noinspection JSUnusedGlobalSymbols
  filterDateToday: Date = new Date();
  filteredActivities: Activity[] = [];
  filterUsers: FilterUser[] = [];
  unread: string[] = [];
  openUserGroups: Activity[] = [];
  showProjectName: boolean = true;
  showEntryName: boolean = true;
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
    // Watch to see if a refresh is required
    $scope.$watch(() => activityService.refreshRequired, (refreshRequired: boolean) => {
      if (refreshRequired === true) {
        this.loadActivityFeed(true);
        activityService.markRefreshRequired(false);
      }
    });
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
      'exclamation-triangle',
      'added {x} global message'));
    this.activityTypes.push(new ActivityType(
      'add_text',
      'project',
      'New Text',
      'file-text',
      'added {x} new text'));
    this.activityTypes.push(new ActivityType(
      'add_user_to_project',
      'project',
      'User added to project',
      'user-plus',
      'was added to {x} project'));
    this.activityTypes.push(new ActivityType(
      'add_question',
      'project',
      'New question',
      'question-circle',
      'added {x} new question'));
    this.activityTypes.push(new ActivityType(
      'add_lex_comment',
      'project',
      'New comment',
      'comments',
      'added {x} new comment'));
    this.activityTypes.push(new ActivityType(
      'add_entry',
      'project',
      'New Entry',
      'file',
      'added {x} new entry',
      'added {x} new entries'));
    this.activityTypes.push(new ActivityType(
      'update_entry',
      'project',
      'Entry Updated',
      'save',
      'updated {x} entry',
      'updated {x} entries'));
    this.activityTypes.push(new ActivityType(
      'delete_entry',
      'project',
      'Entry Deleted',
      'trash',
      'deleted {x} entry',
      'deleted {x} entries'));
    this.activityTypes.push(new ActivityType(
      'add_lex_reply',
      'project',
      'Reply to comment',
      'reply',
      'replied to {x} comment'));
    this.activityTypes.push(new ActivityType(
      'update_lex_reply',
      'project',
      'Update Reply',
      'reply',
      'updated {x} reply'));
    this.activityTypes.push(new ActivityType(
      'delete_lex_reply',
      'project',
      'Delete Reply',
      'trash',
      'deleted {x} reply',
      'deleted {x} replies'));
    this.activityTypes.push(new ActivityType(
      'update_lex_comment_status',
      'project',
      'Comment status changed',
      'pencil-square',
      'changed {x} comment status',
      'changed {x} comment statuses'));
    this.activityTypes.push(new ActivityType(
      'add_comment',
      'project',
      'New Comment',
      'reply',
      'added {x} comment'));
    this.activityTypes.push(new ActivityType(
      'update_comment',
      'project',
      'Update Comment',
      'comments-o',
      'updated {x} comment'));
    this.activityTypes.push(new ActivityType(
      'update_lex_comment',
      'project',
      'Update Comment',
      'comments-o',
      'updated {x} comment'));
    this.activityTypes.push(new ActivityType(
      'delete_lex_comment',
      'project',
      'Delete Comment',
      'trash',
      'deleted {x} comment'));
    this.activityTypes.push(new ActivityType(
      'add_answer',
      'project',
      'New Answer',
      'comments',
      'added {x} answer'));
    this.activityTypes.push(new ActivityType(
      'update_answer',
      'project',
      'Update Answer',
      'comments-o',
      'updated {x} answer'));
    this.activityTypes.push(new ActivityType(
      'lexCommentIncreaseScore',
      'project',
      'Liked',
      'thumbs-up',
      'liked {x} comment'));
    this.activityTypes.push(new ActivityType(
      'increase_score',
      'project',
      '+1\'d',
      'thumbs-up',
      '+`\'d {x} comment'));
    // TODO: Move all definitions into the API so we get everything we need returned
    this.activityService.validActivityTypes().then(result => {
      if (result.ok) {
        // Loop through valid activity types and remove what isn't needed
        for (const index in this.activityTypes) {
          if (this.activityTypes.hasOwnProperty(index)) {
            let activityFound = false;
            for (const activityType of result.data) {
              if (activityType === this.activityTypes[index].action) {
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
            if (userGroup.user != null && userGroup.user.id !== activity.userRef.id) {
              userGroupIndex++;
            }
            if (activityGroup.userGroups[userGroupIndex] == null) {
              userGroup = new ActivityUserGroup(activity);
              activityGroup.userGroups[userGroupIndex] = userGroup;
            }
            activityGroup.userGroups[userGroupIndex].activities.push(activity);
            if (this.isUnread(activity.id)) {
              userGroup.unread++;
            }
            // Open up user group if it was already open
            for (const openActivity of this.openUserGroups) {
              if (openActivity.id === activity.id) {
                activityGroup.userGroups[userGroupIndex].showActivities = true;
              }
            }
          }
        }
        previousDate = activityGroup.date;
      }
    }, true);
  }

  $onChanges(changes: any): void {
    const entryIdChange = changes.entryId as angular.IChangesObject<string>;
    if (entryIdChange != null && entryIdChange.currentValue) {
      this.loadActivityFeed(true);
    }
  }

  loadActivityFeed(reset: boolean = false): void {
    // Reset all activities
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
    if (this.entryId != null) {
      if (this.entryId && !this.entryId.startsWith('_new_')) {
        this.showProjectName = false;
        this.showEntryName = false;
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

  loadMoreActivities(): void {
    this.filterParams.skip += this.filterParams.limit;
    this.loadActivityFeed();
  }

  processActivityListFeed(result: JsonRpcResult): void {
    this.loadingFeed = false;
    if (result.ok) {
      // Prepare the activities
      this.unread = result.data.unread;
      for (const key in result.data.activity) {
        if (result.data.activity.hasOwnProperty(key)) {
          // Cast into our Activity class - may be there is already a built in method for this?
          const activity = new Activity(result.data.activity[key]);
          // Check if the activity as an array of changes as we want each one split out
          if (activity.content.changes && activity.content.changes.length > 0) {
            for (const changeKey in activity.content.changes) {
              if (activity.content.changes.hasOwnProperty(changeKey)) {
                const changedActivity = new Activity(result.data.activity[key]);
                changedActivity.changes = activity.content.changes[changeKey];
                this.activities.push(changedActivity);
              }
            }
          } else {
            this.activities.push(activity);
          }
        }
      }

      this.decodeActivityList(this.activities);
      this.filteredActivities = this.activities;
      this.buildUsersList();
      this.activityService.setUnreadCount(this.getUnreadCount());
    }
  }

  isUnread(id: string): boolean {
    return (this.unread.findIndex(value => value === id) > -1);
  }

  decodeActivityList(items: Activity[]): void {
    for (const item of items) {
      if ('userRef' in item) {
        item.userHref = this.linkService.user(item.userRef.id);
      }

      if ('userRefRelated' in item) {
        item.userHrefRelated = this.linkService.user(item.userRefRelated.id);
      }

      if ('projectRef' in item) {
        item.projectHref =
          this.linkService.project(item.projectRef.id, item.projectRef.type);
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
          item.typeRef = activityType;
          item.icon = activityType.icon;
        }
      }
      // Set default icon
      if (!item.icon) {
        item.icon = 'circle';
      }
    }
  }

  // noinspection JSUnusedGlobalSymbols
  triggerFilter(): void {
    // Reset the filter
    this.filteredActivities = this.activities;
    this.filterByUser();
    this.filterByType();
    this.activityService.setUnreadCount(this.getUnreadCount());
  }

  filterByUser(): void {
    if (!this.filterUser) return;
    const filteredActivities = [];
    for (const activity of this.activities) {
      if (activity.userRef && activity.userRef.id === this.filterUser.id) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  filterByType(): void {
    if (!this.filterType) return;
    const filteredActivities = [];
    for (const activity of this.filteredActivities) {
      if (activity.action === this.filterType.action && activity.type === this.filterType.type) {
        filteredActivities.push(activity);
      }
    }
    this.filteredActivities = filteredActivities;
  }

  // noinspection JSUnusedGlobalSymbols
  filterByDate(): void {
    if (this.filterStartDate != null && this.filterStartDate !== true) {
      this.filterParams.startDate = this.filterStartDate._d;
    } else {
      this.filterParams.startDate = null;
    }
    if (this.filterEndDate != null && this.filterEndDate !== true) {
      this.filterParams.endDate = this.filterEndDate._d;
    } else {
      this.filterParams.endDate = null;
    }
    this.loadActivityFeed(true);
  }

  buildUsersList(): void {
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

  getUnreadCount(): number {
    let unread = 0;
    for (const activity of this.filteredActivities) {
      if (this.isUnread(activity.id)) {
        unread++;
      }
    }
    return unread;
  }

  clickUserGroup(userGroup: ActivityUserGroup) {
    // Show/hide the activities in this user group
    userGroup.showActivities = !userGroup.showActivities;
    // Track the first activity as a way of knowing which user groups are open
    // Need to do it this way as the user group could move around but the activity itself won't
    const firstActivity = userGroup.activities[0];
    if (userGroup.showActivities) {
      this.openUserGroups.push(userGroup.activities[0]);
    } else {
      let index = 0;
      for (const activity of this.openUserGroups) {
        if (activity.id === firstActivity.id) {
          this.openUserGroups.splice(index, 1);
          break;
        }
        index++;
      }
    }
  }
}

export const ActivityContainerComponent: angular.IComponentOptions = {
  bindings: {
    entryId: '@?'
  },
  controller: ActivityContainerController,
  templateUrl: '/angular-app/bellows/apps/activity/activity-container.component.html'
};
