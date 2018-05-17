class UserRef {
  // noinspection TsLint
  avatar_ref: string;
  id: string;
  name: string;
}

export class LexAuthorInfo {
  createdByUserRef: UserRef;
  createdDate: string;
  modifiedByUserRef: UserRef;
  modifiedDate: string;
}
