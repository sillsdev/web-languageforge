import { APIRequestContext } from "@playwright/test";
import { TestControlService, getTestControl } from './test-control-api';
import { UserDetails } from './types';

export class UserTestService {

  private readonly call: TestControlService;

  constructor(request: APIRequestContext) {
    this.call = getTestControl(request);
  }

  async createRandomUser(): Promise<UserDetails & { id: string }> {
    const time = Date.now();
    const user = {
      username: `random_user_${time}`,
      password: `random_user_password`,
      name: `Random user - ${time}`,
      email: `random_user_${time}@example.com`,
    };
    return { ...user, id: await this.createUser(user) };
  }

  createUser(user: UserDetails): Promise<string> {
    return this.call('create_user', [user.username, user.name, user.password, user.email]);
  }

  getResetPasswordKey(usernameOrEmail: string): Promise<string> {
    return this.call('get_reset_password_key', [usernameOrEmail]);
  }

  expireAndGetResetPasswordKey(usernameOrEmail: string) {
    return this.call('expire_and_get_reset_password_key', [usernameOrEmail]);
  }
}
