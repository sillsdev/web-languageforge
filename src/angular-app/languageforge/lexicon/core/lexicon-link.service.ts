import { SessionService } from '../../../bellows/core/session.service';

export class LexiconLinkService {
  static $inject: string[] = ['sessionService'];
  constructor(private sessionService: SessionService) { }

  projectUrl(): string {
	const project = this.sessionService.project()
    return `/projects/${project.projectCode}`
  }

  projectView(view: string): string {
    return this.projectUrl() + view;
  }

  getProjectId(): string {
    return this.sessionService.projectId();
  }
}
