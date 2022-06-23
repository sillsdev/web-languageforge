import { SessionService } from '../../../bellows/core/session.service';

export class LexiconLinkService {
  static $inject: string[] = ['sessionService'];
  constructor(private sessionService: SessionService) { }

  projectUrl(): string {
	return '/app/lexicon/' + this.getProjectId() + '/#!/';
  }

  projectView(view: string): string {
    return this.projectUrl() + view;
  }

  getProjectId(): string {
    return this.sessionService.projectId();
  }
}
