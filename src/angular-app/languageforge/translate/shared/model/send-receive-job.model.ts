import { Resource } from '../../../../bellows/shared/model/resource.model';
import { SendReceiveState } from '../../../lexicon/shared/model/send-receive-status.model';

export class SendReceiveJob extends Resource {
  project: Resource;
  percentCompleted: number;
  state: SendReceiveState;
}
