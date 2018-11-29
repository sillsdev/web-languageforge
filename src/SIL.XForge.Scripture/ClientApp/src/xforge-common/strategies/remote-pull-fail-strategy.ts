import { ConnectionStrategy } from '@orbit/coordinator';

export class RemotePullFailStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'pullFail',

      target: store,

      action: () => this.handlePullFail(),

      blocking: true
    });
  }

  private handlePullFail(): void {
    this.source.requestQueue.skip();
  }
}
