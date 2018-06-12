export class HeaderData {
  pageName: string;
  settings: HeaderSetting[];
}

export class HeaderSetting {
  constructor(public id: string,
              public label: string,
              public href: string = '',
              public divider: boolean = false) { }
}

export class ApplicationHeaderService {
  data: HeaderData;

  constructor() {
    this.data = new HeaderData();
  }

  setPageName(name: string): void {
    this.data.pageName = name;
  }

  setSettings(settings: HeaderSetting[]): void {
    this.data.settings = settings;
  }
}
