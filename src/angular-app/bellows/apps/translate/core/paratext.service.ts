import * as angular from 'angular';

import { UserRestApiService } from '../../../core/api/user-rest-api.service';
import { SessionService } from '../../../core/session.service';
import { ParatextUserInfo } from '../../../shared/model/paratext-user-info.model';

export class ParatextService {
  private signInWindow: Window;
  private signInTask: angular.IDeferred<ParatextUserInfo>;

  static $inject: string[] = ['$window', '$q',
    'sessionService',
    'userRestApiService'];
  constructor(private readonly $window: angular.IWindowService, private readonly $q: angular.IQService,
              private readonly sessionService: SessionService,
              private readonly userRestApiService: UserRestApiService) { }

  get isSigningIn(): boolean {
    return this.signInWindow != null && !this.signInWindow.closed;
  }

  signIn(): angular.IPromise<ParatextUserInfo> {
    if (this.isSigningIn) {
      this.signInWindow.focus();
      return this.signInTask.promise;
    }

    this.signInTask = this.$q.defer<ParatextUserInfo>();
    const wLeft = this.$window.screenLeft ? this.$window.screenLeft : this.$window.screenX;
    const wTop = this.$window.screenTop ? this.$window.screenTop : this.$window.screenY;
    const width = 760;
    const height = 852;
    const left = wLeft + (this.$window.innerWidth / 2) - (width / 2);
    const top = wTop + (this.$window.innerHeight / 2) - (height / 2);
    const features = 'top=' + top + ',left=' + left + ',width=' + width + ',height=' + height + ',menubar=0,toolbar=0';
    this.signInWindow = this.$window.open('/oauthcallback/paratext', 'ParatextSignIn', features);
    const checkWindow = setInterval(() => {
      if (this.isSigningIn) {
        return;
      }

      clearInterval(checkWindow);
      this.signInWindow = null;
      this.getUserInfo()
        .then(pui => this.signInTask.resolve(pui))
        .catch(err => this.signInTask.reject(err));
    }, 100);
    return this.signInTask.promise;
  }

  getUserInfo(): angular.IPromise<ParatextUserInfo> {
    return this.sessionService.getSession()
      .then(session => this.userRestApiService.getParatextInfo(session.userId()));
  }
}
