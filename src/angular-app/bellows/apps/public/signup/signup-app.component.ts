import * as angular from 'angular';

import {UserService} from '../../../core/api/user.service';
import {SessionService} from '../../../core/session.service';
import {CaptchaData} from '../../../shared/model/captcha.model';
import {UserWithPassword} from '../../../shared/model/user-password.model';

class UserSignup extends UserWithPassword {
  captcha?: string;
}

class ZxcvbnPasswordStrength {
  score: number;
}

export class SignupAppController implements angular.IController {
  showPassword = false;
  emailValid = true;
  emailProvided = false;
  nameProvided = false;
  avatarProvided = false;
  submissionInProgress = false;
  emailExists = false;
  takenEmail = '';
  passwordIsWeak = false;
  passwordStrength = new ZxcvbnPasswordStrength();
  captchaData: CaptchaData = {} as CaptchaData;
  captchaFailed = false;
  record = new UserSignup();
  hostname: string;

  static $inject = ['$scope', '$location',
    '$window',
    'userService', 'sessionService'];
  constructor(private readonly $scope: any, private readonly $location: angular.ILocationService,
              private readonly $window: angular.IWindowService,
              private readonly userService: UserService, private readonly sessionService: SessionService) {}

  $onInit() {
    this.record.id = '';
    this.record.password = '';

    // Parse for user details if given
    const email = this.$location.search().e;
    if (email != null && email.length > 0) {
      this.record.email = decodeURIComponent(email);
      this.emailProvided = true;
    }
    const name = this.$location.search().n;
    if (name != null && name.length > 0) {
      this.record.name = decodeURIComponent(name);
      this.nameProvided = true;
    }
    const avatar = this.$location.search().a;
    if (avatar != null && avatar.length > 0) {
      this.record.avatar_ref = decodeURIComponent(avatar);
      this.avatarProvided = true;
    }

    this.sessionService.getSession().then(session => {
      // signup app should only show when no user is present (not logged in)
      if (session.userId() != null) {
        this.$window.location.href = '/app/projects';
      }
    });

    this.hostname = this.$window.location.hostname;

    // we need to watch the passwordStrength score because zxcvbn seems to be changing the score
    // after the ng-change event.  Only after zxcvbn changes should we validate the form
    this.$scope.$watch(() => this.passwordStrength.score, () => {
      this.validateForm();
    });

    this.getCaptchaData();
  }

  validateForm() {
    this.emailValid = this.$scope.signupForm.email.$pristine ||
      ((this.$scope.signupForm.email.$dirty || this.emailProvided) && !this.$scope.signupForm.$error.email);

    if (this.record.password) {
      this.passwordIsWeak = this.passwordStrength.score < 2 || this.record.password.length < 7;
    } else {
      this.passwordIsWeak = false;
    }
  }

  processForm() {
    this.registerUser((url: string) => {
      this.$window.location.href = url;
    });
  }

  private getCaptchaData() {
    this.sessionService.getCaptchaData().then(result => {
      if (result.ok) {
        this.captchaData = result.data as CaptchaData;
        this.record.captcha = null;
      }
    });
  }

  private registerUser(successCallback: (url: string) => void) {
    this.captchaFailed = false;
    this.submissionInProgress = true;
    this.userService.register(this.record).then(result => {
      if (result.ok) {
        switch (result.data) {
          case 'captchaFail':
            this.captchaFailed = true;
            this.getCaptchaData();
            break;
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

export const SignupAppComponent: angular.IComponentOptions = {
  controller: SignupAppController,
  templateUrl: '/angular-app/bellows/apps/public/signup/signup-app.component.html'
};
