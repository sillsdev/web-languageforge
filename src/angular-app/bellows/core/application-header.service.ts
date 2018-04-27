export class HeaderData {
  pageName: string;
}

export class ApplicationHeaderService {
  data: HeaderData;

  constructor() {
    this.data = new HeaderData();
  }

  setPageName($name: string) {
    console.log($name);
    this.data.pageName = $name;
  }
}
