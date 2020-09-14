export interface ApiMembership {
  [username: string]: string;
}

export interface Membership {
  username: string;
  role: string;
}

export interface ApiProject {
  code: string;
  name: string;
  description: string;
  membership: ApiMembership;
}

export type Project = Omit<ApiProject, 'membership'> & {
  membership: Membership[];
};

export function toMembership(apiMembership: ApiMembership): Membership[] {
  return Object.entries(apiMembership).map(([username, role]) => ({username, role}));
}

export function toProject(apiProject: ApiProject): Project {
  const {membership, ...rest} = apiProject;
  return {membership: toMembership(membership), ...rest};
}
