export interface Options<T> {
  options: { [key: string]: T };
}

export interface OrderedOptions<T> extends Options<T> {
  // array of keys to options
  optionsOrder: string[];
}
