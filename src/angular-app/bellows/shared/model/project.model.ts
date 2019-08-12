export interface Project {
  appName: string;
  dateModified: string;
  id: string;
  ownerId: string;
  projectCode?: string;
  projectName: string;
  role: string;
  anonymousUserRole: string;
  reusableInviteLinkRole: string;
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
}
