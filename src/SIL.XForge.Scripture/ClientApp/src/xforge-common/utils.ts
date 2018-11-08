export function nameof<T>(name: Extract<keyof T, string>): string {
  return name;
}

export function isLocalUrl(url: string): boolean {
  if (url == null) {
    return false;
  }
  const r = new RegExp('^(?:[a-z]+:)?//', 'i');
  return !r.test(url);
}
