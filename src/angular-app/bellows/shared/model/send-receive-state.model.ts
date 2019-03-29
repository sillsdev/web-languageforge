// SRStates with an "LF_" prefix are languageforge overrides
export enum SendReceiveState {
  Idle = 'IDLE',
  Hold = 'HOLD',
  Error = 'ERROR',
  Cloning = 'CLONING',
  Syncing = 'SYNCING',
  Pending = 'PENDING',
  Synced = 'SYNCED',
  CloneRequested = 'LF_CLONING',
  Unsynced = 'LF_UNSYNCED',
  Unknown = 'LF_CHECK'
}
