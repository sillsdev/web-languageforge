import { SendReceiveState } from '../../../../bellows/shared/model/send-receive-state.model';

export class SendReceiveStatus {
  SRState: SendReceiveState;
  LastStateChangeTicks: number;
  StartTimestamp: number;
  PercentComplete: number;
  ElapsedTimeSeconds: number;
  TimeRemainingSeconds: number;
  TotalSteps: number;
  CurrentStep: number;
  RetryCounter: number;
  UncommittedEditCounter: number;
  ErrorMessage: string;
  ErrorCode: number;
  PreviousRunTotalMilliseconds: number;
  ProjectCode: string;
}
