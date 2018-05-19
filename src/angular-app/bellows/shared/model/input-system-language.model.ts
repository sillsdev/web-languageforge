export class InputSystemLanguage {
  name: string;
  code: InputSystemLanguageCode = new InputSystemLanguageCode();
  country: string[];
  altNames: string[];
}

class InputSystemLanguageCode {
  three: string;
  two?: string;
}
