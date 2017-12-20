export class ParatextProject {
  id: string;
  username: string;
  languageTag: string;
  languageName: string;
}

export class ParatextUserInfo {
  username: string;
  projects: ParatextProject[];
}
