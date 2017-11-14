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

export enum SendReceiveState {
  Idle = 'IDLE',
  Hold = 'HOLD',
  Cloning = 'CLONING',
  Syncing = 'SYNCING',
  Pending = 'PENDING',
  Synced = 'SYNCED',
  CloneRequested = 'LF_CLONING',
  Unsynced = 'LF_UNSYNCED',
  Unknown = 'LF_CHECK'
}
