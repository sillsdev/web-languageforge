import { ConnectionStrategy } from '@orbit/coordinator';

/**
 * This strategy is responsible for handling remote query request failures.
 */
export class RemotePullFailStrategy extends ConnectionStrategy {
  constructor(remote: string) {
    super({
      source: remote,
      on: 'pullFail',

      action: () => this.handlePullFail(),

      blocking: true
    });
  }

  private async handlePullFail(): Promise<void> {
    await this.source.requestQueue.skip();
  }
}
