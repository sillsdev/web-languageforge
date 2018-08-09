export interface CaptchaData {
  items: CaptchaItem[];
  expectedItemName: string;
}

export interface CaptchaItem {
  name: string;
  imgSrc: string;
}
