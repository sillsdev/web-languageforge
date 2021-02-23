export interface LdapiUserInfo {
  username: string;
  email?: string;
  firstname: string;
  lastname: string;
  language?: string;
  admin?: boolean|number;
}

export interface LdapiProjectMembership {
  user: LdapiUserInfo,
  role: string
}

// Old, for the .NET Core API:
// export interface LdapiProjectDto {
//   code: string;
//   description: string;
//   name: string;
//   membership: [LdapiUserInfo, string][];
// }

// Project info returned in "list" queries like GET /api/v2/projects omits membership info
export interface LdapiProjectInfo {
  projectCode: string;
  description: string;
  name: string;
}

// Project info returned in "single project" queries includes membership info
export interface LdapiProjectDto {
  projectCode: string;
  description: string;
  name: string;
  members: LdapiProjectMembership[];
}
