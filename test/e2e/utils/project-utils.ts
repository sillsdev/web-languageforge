import { APIRequestContext, TestInfo } from "@playwright/test";
import { Project, UserDetails } from "./types";
import { getTestControl, TestControlService } from './test-control-api';
import { TestFile } from "./path-utils";

const toProjectCode = (name: string): string => name.toLowerCase().replace(/[ \.]/g, '_');

export const toProject = (name: string, id?: string): Project => ({
  name,
  code: toProjectCode(name),
  id: id ?? '',
});

const getCode = (project: string | Project): string => {
  return typeof project === 'object' ? project.code : project;
};

export class ProjectTestService {

  private readonly call: TestControlService;

  constructor(request: APIRequestContext) {
    this.call = getTestControl(request);
  }

  async initTestProject(
    name: string,
    code: string | undefined,
    owner: UserDetails,
    members: UserDetails[] = []): Promise<Project> {
    const projectCode = code ?? toProjectCode(name);
    const id = await this.call('init_test_project',
      [projectCode, name, owner.username, members.map(user => user.username)]);
    return { name, code: projectCode, id };
  }

  async initTestProjectForTest(
    testInfo: TestInfo,
    owner: UserDetails,
    members: UserDetails[] = []): Promise<Project> {
    // Make sure it's short enough to be a database name
    const name = `${testInfo.title.slice(0, 40)}`;
    const code = toProjectCode(name);
    return this.initTestProject(name, code, owner, members);
  }

  addWritingSystemToProject(project: Project, languageTag: string, abbr = '', name = '') {
    return this.call('add_writing_system_to_project', [project.code, languageTag, abbr, name]);
  }

  // Can also be used to update roles of existing users
  addUserToProject(project: Project, user: UserDetails, role?: string) {
    return this.call('add_user_to_project', [project.code, user.username, role]);
  }

  addPictureFileToProject(project: Project, filename: TestFile) {
    return this.call('add_picture_file_to_project', [project.code, filename]);
  }

  addAudioVisualFileToProject(project: Project, filename: TestFile) {
    return this.call('add_audio_visual_file_to_project', [project.code, filename]);
  }

  addLexEntry(projectCode: string | Project, data: any) {
    if (data.id == null) data.id = '';
    return this.call('add_lexical_entry', [getCode(projectCode), data]) as Promise<string>;
  }
}
