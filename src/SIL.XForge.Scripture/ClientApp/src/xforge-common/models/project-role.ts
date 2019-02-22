export enum ProjectRoles {
  None = 'none'
}

export const NONE_ROLE: ProjectRole = { role: ProjectRoles.None, displayName: 'None' };

export interface ProjectRole {
  role: string;
  displayName: string;
}
