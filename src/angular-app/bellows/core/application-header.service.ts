export class HeaderData {
  pageName: string;
  settings: HeaderSetting[];
}

export class HeaderSetting {
  constructor(private id: string,
              private label: string,
              private href: string = '',
              public divider: boolean = false) { }
}

export class ApplicationHeaderService {
  data: HeaderData;

  constructor() {
    this.data = new HeaderData();
  }

  setPageName($name: string) {
    this.data.pageName = $name;
  }

  setSettings($settings: HeaderSetting[]) {
    this.data.settings = $settings;
  }
}
