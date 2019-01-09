import { SFProjectBase } from './sfdomain-model.generated';

export class SFProject extends SFProjectBase {
  get taskNames(): string[] {
    const names: string[] = [];
    if (this.checkingConfig != null && this.checkingConfig.enabled) {
      names.push('Community Checking');
    }
    if (this.translateConfig != null && this.translateConfig.enabled) {
      names.push('Translate');
    }
    return names;
  }
}

export { SFProjectRef } from './sfdomain-model.generated';
