import * as angular from 'angular';

import {UserService} from '../../core/api/user.service';
import { ProjectService } from '../../core/api/project.service';
import {ApplicationHeaderService} from '../../core/application-header.service';
import {BreadcrumbService} from '../../core/breadcrumbs/breadcrumb.service';
import {SiteWideNoticeService} from '../../core/site-wide-notice-service';
import {ModalService} from '../../core/modal/modal.service';
import {NoticeService} from '../../core/notice/notice.service';
import {UtilityService} from '../../core/utility.service';
import {UserProfile} from '../../shared/model/user-profile.model';
import { Project } from '../../shared/model/project.model';

interface UserProfileAppControllerScope extends angular.IScope {
  userprofileForm: angular.IFormController;
}

export class UserProfileAppController implements angular.IController {
  getAvatarUrl = UtilityService.getAvatarUrl;
  projectsSettings: any[];
  emailValid = true;
  usernameValid = true;
  originalUsername = '';
  dropdown = {
    avatarColors: {},
    avatarShapes: {}
  };
  takenEmail = '';
  takenUsername = '';
  user = new UserProfile();
  emailExists: boolean;
  usernameExists: boolean;

  ownsAProject: boolean = false;

  projects: Project[] = [];
  finishedLoadingOwnedProjects: boolean = false;
  ownedProjects: Project[] = [];

  private initColor = '';
  private initShape = '';

  static $inject = ['$scope', '$window',
    'userService', 'projectService', 'modalService', 'silNoticeService',
    'breadcrumbService',
    'siteWideNoticeService',
    'applicationHeaderService'];
  constructor(private $scope: UserProfileAppControllerScope, private $window: angular.IWindowService,
              private userService: UserService, private projectService: ProjectService, private modalService: ModalService, private notice: NoticeService,
              private breadcrumbService: BreadcrumbService,
              private siteWideNoticeService: SiteWideNoticeService,
              private applicationHeaderService: ApplicationHeaderService) {}

  $onInit(): void {
    this.finishedLoadingOwnedProjects = false;
    this.user.avatar_ref = UserProfileAppController.getAvatarRef('', '');

    this.$scope.$watch(() => this.user.avatar_color, () => {
      this.user.avatar_ref = UserProfileAppController.getAvatarRef(this.user.avatar_color, this.user.avatar_shape);
      if (this.user.avatar_color === '') {
        this.user.avatar_color = null;
      }
    });

    this.$scope.$watch(() => this.user.avatar_shape, () => {
      this.user.avatar_ref = UserProfileAppController.getAvatarRef(this.user.avatar_color, this.user.avatar_shape);
      if (this.user.avatar_shape === '') {
        this.user.avatar_shape = null;
      }
    });

    this.siteWideNoticeService.displayNotices();

    this.loadUser(); // load the user data right away

    this.dropdown.avatarColors = [
      { value: 'purple4', label: 'Purple' },
      { value: 'green', label: 'Green' },
      { value: 'chocolate4', label: 'Chocolate' },
      { value: 'turquoise4', label: 'Turquoise' },
      { value: 'LightSteelBlue4', label: 'Steel Blue' },
      { value: 'DarkOrange', label: 'Dark Orange' },
      { value: 'HotPink', label: 'Hot Pink' },
      { value: 'DodgerBlue', label: 'Blue' },
      { value: 'plum', label: 'Plum' },
      { value: 'red', label: 'Red' },
      { value: 'gold', label: 'Gold' },
      { value: 'salmon', label: 'Salmon' },
      { value: 'DarkGoldenrod3', label: 'Dark Golden' },
      { value: 'chartreuse', label: 'Chartreuse' },
      { value: 'LightBlue', label: 'Light Blue' },
      { value: 'LightYellow', label: 'Light Yellow' }
    ];

    this.dropdown.avatarShapes = [
      { value: 'camel', label: 'Camel' },
      { value: 'cow', label: 'Cow' },
      { value: 'dog', label: 'Dog' },
      { value: 'elephant', label: 'Elephant' },
      { value: 'frog', label: 'Frog' },
      { value: 'gorilla', label: 'Gorilla' },
      { value: 'hippo', label: 'Hippo' },
      { value: 'horse', label: 'Horse' },
      { value: 'kangaroo', label: 'Kangaroo' },
      { value: 'mouse', label: 'Mouse' },
      { value: 'otter', label: 'Otter' },
      { value: 'pig', label: 'Pig' },
      { value: 'rabbit', label: 'Rabbit' },
      { value: 'rhino', label: 'Rhino' },
      { value: 'sheep', label: 'Sheep' },
      { value: 'tortoise', label: 'Tortoise' }
    ];

    this.queryProjectsForUser();

  }

  validateForm(): void {
    this.emailValid = this.$scope.userprofileForm.email.$pristine ||
      (this.$scope.userprofileForm.email.$dirty && !this.$scope.userprofileForm.$error.email);

    this.usernameValid = this.$scope.userprofileForm.username.$pristine ||
      (this.$scope.userprofileForm.username.$dirty && !this.$scope.userprofileForm.$error.username);

    this.userService.checkUniqueIdentity(this.user.id, this.user.username, this.user.email,
       result => {
      if (result.ok) {
        switch (result.data) {
          case 'usernameExists' :
            this.usernameExists = true;
            this.emailExists = false;
            this.takenUsername = this.user.username.toLowerCase();
            this.$scope.userprofileForm.username.$setPristine();
            break;
          case 'emailExists' :
            this.usernameExists = false;
            this.emailExists = true;
            this.takenEmail = this.user.email.toLowerCase();
            this.$scope.userprofileForm.email.$setPristine();
            break;
          case 'usernameAndEmailExists' :
            this.usernameExists = true;
            this.emailExists = true;
            this.takenUsername = this.user.username.toLowerCase();
            this.takenEmail = this.user.email.toLowerCase();
            this.$scope.userprofileForm.username.$setPristine();
            this.$scope.userprofileForm.email.$setPristine();
            break;
          default:
            this.usernameExists = false;
            this.emailExists = false;
        }
      }
    });
  }

  checkIfUserOwnsAProject(){
    this.ownsAProject = false;
    if(this.projects.length > 0){
      this.projects.forEach(project => {
        if(project.ownerId === this.user.id){
          this.ownsAProject = true;
        }
      });
    }
  }

  queryProjectsForUser() {
    this.finishedLoadingOwnedProjects = false;
    this.projects = [];
    this.ownedProjects = [];
    this.projectService.list().then((projects: Project[]) => {
      this.projects = projects || [];
      this.checkIfUserOwnsAProject();
      if(this.ownsAProject){
        this.findOwnedProjects();
      }
      this.finishedLoadingOwnedProjects = true;
      console.log('finished loading projects', {ownsAProject: this.ownsAProject, finishedLoading: this.finishedLoadingOwnedProjects});
    }).catch(console.error);
  }

  findOwnedProjects() {
    this.projects.forEach(project => {
      if(project.ownerId === this.user.id){
        this.ownedProjects.push(project);
      }
    });
  }

  submit(): void {
    if (this.user.username !== this.originalUsername) {
      // Confirmation for username change
      const message = 'Changing Username from <b>' + this.originalUsername + '</b> to <b>' +
        this.user.username + '</b> will force you to login again.<br><br>' +
        'Do you want to save changes?';
      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Save changes',
        headerText: 'Changing username?',
        bodyText: message
      };
      this.modalService.showModal({}, modalOptions).then(() => {
        this.updateUser();

        // catch is necessary to properly implement promise API, which angular 1.6 complains if we
        // don't have a catch
      }).catch(() => {});
    } else if (this.user.active == false){

    } else {
      this.updateUser();
    }
  }

  private loadUser(): void {
    this.userService.readProfile(result => {
      if (result.ok) {
        this.user = result.data.userProfile;
        this.originalUsername = this.user.username;
        this.initColor = this.user.avatar_color;
        this.initShape = this.user.avatar_shape;
        this.projectsSettings = result.data.projectsSettings;

		this.breadcrumbService.set('top', [
          { label: 'User Profile' }
        ]);
        this.applicationHeaderService.setPageName(this.user.name + '\'s User Profile');
      }
    });
  }

  private updateUser(): void {
    this.userService.updateProfile(this.user, result => {
      if (result.ok) {
        if (this.user.avatar_color !== this.initColor || this.user.avatar_shape !== this.initShape) {
          const newAvatarUrl = this.getAvatarUrl(this.user.avatar_ref);
          ['mobileSmallAvatarURL', 'smallAvatarURL'].forEach(id => {
            const imageElement = this.$window.document.getElementById(id) as HTMLImageElement;
            if (imageElement) imageElement.src = newAvatarUrl;
          });
        }

        if (result.data === 'login') {
          this.notice.push(this.notice.SUCCESS, 'Username changed. Please login.');
          this.$window.location.href = '/auth/logout';
        } else {
          this.notice.push(this.notice.SUCCESS, 'Profile updated successfully');
        }
      }
    });
  }

  checkIfUserOwnsAProject(){
    this.ownsAProject = false;
    if(this.projects.length > 0){
      this.projects.forEach(project => {
        if(project.ownerId === this.user.id){
          this.ownsAProject = true;
        }
      });
    }
  }

  queryProjectsForUser() {
    this.finishedLoadingOwnedProjects = false;
    this.projects = [];
    this.ownedProjects = [];
    this.projectService.list().then((projects: Project[]) => {
      this.projects = projects || [];
      this.checkIfUserOwnsAProject();
      if(this.ownsAProject){
        this.findOwnedProjects();
      }
      this.finishedLoadingOwnedProjects = true;
    }).catch(console.error);
  }

  findOwnedProjects() {
    this.projects.forEach(project => {
      if(project.ownerId === this.user.id){
        this.ownedProjects.push(project);
      }
    });
  }


  deleteOwnAccount() {
    const modalOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Delete',
      headerText: 'Permanently delete your account?',
      bodyText: 'Are you sure you want to delete your account?\n' +
      'This is a permanent action and cannot be restored.'
    };
    this.modalService.showModal({}, modalOptions).then(() => {
      this.userService.deleteAccounts([this.user.id]).then(() => {
        this.notice.push(this.notice.SUCCESS, 'Your account was permanently deleted');
        this.$window.location.href = '/auth/logout'; // goes to the log in screen
      });
    }, () => {});

  }


  static getAvatarUrl(avatarRef: string): string {
    if (avatarRef) {
      return (avatarRef.startsWith('http')) ? avatarRef : '/Site/views/shared/image/avatar/' + avatarRef;
    } else {
      return '';
    }
  }

  private static getAvatarRef(color?: string, shape?: string): string {
    if (!color || !shape) {
      return 'anonymoose.png';
    }

    return color + '-' + shape + '-128x128.png';
  }

}

export const UserProfileAppComponent: angular.IComponentOptions = {
  controller: UserProfileAppController,
  templateUrl: '/angular-app/bellows/apps/userprofile/user-profile-app.component.html'
};
