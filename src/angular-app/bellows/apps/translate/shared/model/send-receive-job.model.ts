import { Resource } from '../../../../shared/model/resource.model';
import { SendReceiveState } from '../../../../shared/model/send-receive-state.model';

export class SendReceiveJob extends Resource {
  project: Resource;
  percentCompleted: number;
  state: SendReceiveState;
}
