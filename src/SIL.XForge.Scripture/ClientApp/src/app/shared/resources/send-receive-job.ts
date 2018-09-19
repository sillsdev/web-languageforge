import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export class SendReceiveJobConstants {
  static readonly TYPE = 'send-receive-job';
}

export interface SendReceiveJobAttributes extends Dict<any> {
  percentCompleted?: number;
  state?: string;
}

export interface SendReceiveJob extends Record {
  attributes?: SendReceiveJobAttributes;
}
