import * as angular from 'angular';

import { UserService } from '../../../core/api/user.service';
import { SiteWideNoticeService } from '../../../core/site-wide-notice-service';
import { SessionService } from '../../../core/session.service';
import { User } from '../../../shared/model/user.model';

export class OAuthSignupAppController implements angular.IController {
  oauthFullName: string;
  oauthEmail: string;
  oauthAvatar: string;
  oauthId: string;  // Not currently used
  loginPath: string;
  websiteName: string;
  dropdown = {
    avatarColors: {},
    avatarShapes: {}
  };
  avatarChoice = {
    avatar_color: '',
    avatar_shape: ''
  };
  submissionInProgress = false;
  emailExists = false;
  usernameExists = false;
  usernameValid = false;
  takenUsername = '';
  record = new User();
  hostname: string;

  static $inject = ['$scope', '$location', '$window',
    'siteWideNoticeService',
    'userService', 'sessionService'];
  constructor(private $scope: any, private $location: angular.ILocationService,
              private $window: angular.IWindowService,
              private siteWideNoticeService: SiteWideNoticeService,
              private userService: UserService, private sessionService: SessionService) {}

  $onInit() {
    this.record.id = '';

    if (this.oauthEmail !== undefined && this.oauthEmail.length > 0) {
      this.record.email = this.oauthEmail;
    }
    if (this.oauthFullName !== undefined && this.oauthFullName.length > 0) {
      this.record.name = this.oauthFullName;
      this.calculateUsername(this.record.name).then(username => {
        this.record.username = username;
        this.validateForm();
      });
    }
    if (this.oauthAvatar !== undefined && this.oauthAvatar.length > 0) {
      this.record.avatar_ref = this.oauthAvatar;
    }

    this.sessionService.getSession().then(session => {
      // signup app should only show when no user is present (not logged in)
      if (angular.isDefined(session.userId())) {
        this.$window.location.href = '/app/projects';
      }
    });

    this.siteWideNoticeService.displayNotices();

    // TODO: This is duplicated from the userprofile app. Should refactor avatar stuff into separate library.
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
      this.record.avatar_ref = this.getAvatarRef(this.avatarChoice.avatar_color, this.avatarChoice.avatar_shape);
    });

    this.$scope.$watch(() => this.avatarChoice.avatar_shape, () => {
      this.record.avatar_ref = this.getAvatarRef(this.avatarChoice.avatar_color, this.avatarChoice.avatar_shape);
    });

    this.hostname = this.$window.location.hostname;
    this.$scope.website_name = this.websiteName;
  }

  calculateUsername(usernameBase: string) {
    return this.userService.calculateUsername(usernameBase).then(result => {
      if (result.ok) {
        return result.data;
      } else {
        throw result.statusText;
      }
    }).catch(reason => {
      // Ignore errors in this one
    });
  }

  validateForm(): void {
    this.usernameValid = this.$scope.oauthSignupForm.username && !this.$scope.oauthSignupForm.$error.username;

    this.userService.checkUniqueIdentity(this.record.id, this.record.username, this.record.email,
      result => {
        if (result.ok) {
          switch (result.data) {
            case 'usernameExists' :
              this.usernameExists = true;
              this.takenUsername = this.record.username.toLowerCase();
              break;
            case 'emailExists' :
              // Shouldn't happen since OAuth login would have matched email
              this.usernameExists = false;
              break;
            case 'usernameAndEmailExists' :
              // Shouldn't happen since OAuth login would have matched email
              this.usernameExists = true;
              this.takenUsername = this.record.username.toLowerCase();
              break;
            default:
              this.usernameExists = false;
          }
        }
      });
  }

  avatarHasColorAndShape(color?: string, shape?: string) {
    return (color && shape);
  }

  getAvatarUrl(avatarRef: string, size?: string): string {
    if (avatarRef) {
      if (avatarRef.startsWith('http')) {
        if (size) {
          if (avatarRef.startsWith('https://graph.facebook.com')) {
            return avatarRef + '?type=square&height=' + size;
          } else {
            return avatarRef + '?sz=' + size;
          }
        } else {
          return avatarRef;
        }
      } else {
        return '/Site/views/shared/image/avatar/' + avatarRef;
      }
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

  private getAvatarRef(color?: string, shape?: string): string {
    if (!color || !shape) {
      return (this.oauthAvatar) ? this.oauthAvatar : 'anonymoose.png';
    }

    return color + '-' + shape + '-128x128.png';
  }

  private registerUser(successCallback: (url: string) => void) {
    this.submissionInProgress = true;
    this.userService.registerOAuthUser(this.record, result => {
      if (result.ok) {
        switch (result.data) {
          case 'usernameNotAvailable':
            // Shouldn't happen since OAuth login would have matched email
            this.usernameExists = true;
            this.takenUsername = this.record.username.toLowerCase();
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
    loginPath: '@',
    websiteName: '@'
  },
  controller: OAuthSignupAppController,
  templateUrl: '/angular-app/bellows/apps/public/oauth-signup/oauth-signup-app.component.html'
};
