import * as angular from 'angular';

import { UserService } from '../../../core/api/user.service';
import { SessionService } from '../../../core/session.service';
import { User } from '../../../shared/model/user.model';

export class OAuthSignupAppController implements angular.IController {
  public oauthFullName: string;
  public oauthEmail: string;
  public oauthAvatar: string;
  public oauthId: string;
  public websiteName: string;
  emailValid = true;
  emailProvided = false;
  nameProvided = false;
  avatarProvided = false;
  dropdown = {
    avatarColors: {},
    avatarShapes: {},
  };
  avatarChoice = {
    avatar_color: '',
    avatar_shape: '',
  };
  submissionInProgress = false;
  emailExists = false;
  takenEmail = '';
  record = new User();
  hostname: string;

  static $inject = ['$scope', '$location', '$window',
    'userService', 'sessionService'];
  constructor(private $scope: any, private $location: angular.ILocationService,
              private $window: angular.IWindowService,
              private userService: UserService, private sessionService: SessionService) {}

  $onInit() {
    this.record.id = '';

    if (this.oauthEmail !== undefined && this.oauthEmail.length > 0) {
      this.record.email = this.oauthEmail;
      this.emailProvided = true;
    }
    if (this.oauthFullName !== undefined && this.oauthFullName.length > 0) {
      this.record.name = this.oauthFullName;
      this.nameProvided = true;
    }
    if (this.oauthAvatar !== undefined && this.oauthAvatar.length > 0) {
      // this.oauthAvatar = this.oauthAvatar.replace('sz=50', 'sz=100');  // TODO: Do this somewhere in the OAuth PHP code
      this.record.avatar_ref = this.oauthAvatar;
      this.avatarProvided = true;
    }
    console.log("OAuthSignupAppController.$onInit() called, and websiteName is", this.websiteName, 'and oauth ID is', this.oauthId, 'and avatar is', this.oauthAvatar);

    this.sessionService.getSession().then((session) => {
      // signup app should only show when no user is present (not logged in)
      if (angular.isDefined(session.userId())) {
        this.$window.location.href = '/app/projects';
      }
    });

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

    this.$scope.$watch(() => this.avatarChoice.avatar_color, () => {
      console.log("Avatar color changed to", this.avatarChoice.avatar_color);
      this.record.avatar_ref = this.getAvatarRef(this.avatarChoice.avatar_color, this.avatarChoice.avatar_shape);
      console.log("Avatar ref is now", this.record.avatar_ref);
    });

    this.$scope.$watch(() => this.avatarChoice.avatar_shape, () => {
      console.log("Avatar shape changed to", this.avatarChoice.avatar_shape);
      this.record.avatar_ref = this.getAvatarRef(this.avatarChoice.avatar_color, this.avatarChoice.avatar_shape);
      console.log("Avatar ref is now", this.record.avatar_ref);
    });

    this.hostname = this.$window.location.hostname;
    this.$scope.website_name = this.websiteName;
  }

/* Uncomment if we also want to allow users to pick their own usernames
  validateForm(): void {
    this.emailValid = this.$scope.userprofileForm.email.$pristine ||
      (this.$scope.userprofileForm.email.$dirty && !this.$scope.userprofileForm.$error.email);
    this.usernameValid = this.$scope.userprofileForm.username.$pristine ||
      (this.$scope.userprofileForm.username.$dirty && !this.$scope.userprofileForm.$error.username);

    this.userService.checkUniqueIdentity(this.record.id, this.record.username, this.record.email,
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
*/
  private getAvatarRef(color?: string, shape?: string): string {
    if (!color || !shape) {
      return (this.oauthAvatar) ? this.oauthAvatar : 'anonymoose.png';
    }

    return color + '-' + shape + '-128x128.png';
  }

  public getAvatarUrl(avatarRef: string): string {
    if (avatarRef) {
      return (avatarRef.startsWith('http')) ? avatarRef : '/Site/views/shared/image/avatar/' + avatarRef;
    } else {
      return '';
    }
  }

  resetAvatar() {
    this.avatarChoice.avatar_color = '';
    this.avatarChoice.avatar_shape = '';
  }

  processForm() {
    this.registerUser((url: string) => {
      this.$window.location.href = url;
    });
  }

  private registerUser(successCallback: (url: string) => void) {
    this.submissionInProgress = true;
    this.userService.register(this.record, (result) => {
      if (result.ok) {
        switch (result.data) {
          case 'emailNotAvailable':
            this.emailExists = true;
            this.takenEmail = this.record.email.toLowerCase();
            this.$scope.signupForm.email.$setPristine();
            break;
          case 'login':
            successCallback('/app/projects');
            break;
        }
      }

      this.submissionInProgress = false;
    });
  }
}

export const OAuthSignupAppComponent: angular.IComponentOptions = {
  bindings: {
    oauthFullName: '@',
    oauthEmail: '@',
    oauthAvatar: '@',
    oauthId: '@',
    websiteName: '@'
  },
  controller: OAuthSignupAppController,
  templateUrl: '/angular-app/bellows/apps/public/oauth-signup/oauth-signup-app.component.html'
};
