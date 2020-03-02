export interface Project {
  appName: string;
  dateModified: string;
  id: string;
  ownerId: string;
  projectCode?: string;
  projectName: string;
  role: string;
  anonymousUserRole: string;
  allowSharing: boolean;
  siteName: string;
  type?: string;
  isArchived: boolean;
  userIsProjectOwner: boolean;
  ownerRef: {
    id: string,
    username: string;
  };
  slug: string;
  appLink: string;
  featured?: boolean | string;
  interfaceLanguageCode?: string;
  inviteToken: {
    token: string;
    defaultRole: string;
  };
}

export interface ProjectRole {
  name: string;
  key: string;
}

export class ProjectRoles {
  static MANAGER: ProjectRole = { name: 'Manager', key: 'project_manager' };
  static CONTRIBUTOR: ProjectRole = { name: 'Contributor', key: 'contributor' };
  static TECH_SUPPORT: ProjectRole = { name: 'Tech Support', key: 'tech_support' };
  static NONE: ProjectRole = { name: 'none', key: 'none' };
}
