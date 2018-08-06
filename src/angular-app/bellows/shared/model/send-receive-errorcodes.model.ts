export enum SendReceiveErrorCodes {
  NoError = 0,
  Unspecified = 1,

  EmptyProject = 10,
  NoFlexProject = 11,

  UnhandledException = 20,
  Unauthorized       = 30,

  UnspecifiedBranchError = 50,
  ProjectTooOld = 51, // Project < 7000068
  ProjectTooNew = 52
}
