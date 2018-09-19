import { Resource, ResourceAttributes } from '@xforge-common/resources/resource';

export class SendReceiveJobConstants {
  static readonly TYPE = 'send-receive-job';
}

export interface SendReceiveJobAttributes extends ResourceAttributes {
  percentCompleted?: number;
  state?: string;
}

export interface SendReceiveJob extends Resource {
  attributes?: SendReceiveJobAttributes;
}
