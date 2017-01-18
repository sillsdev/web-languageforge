import { Component } from '@angular/core';

import { LfApiService } from '../shared/services/lf-api.service';
import { ProjectService } from '../shared/services/project.service';
import { CommentService } from '../shared/services/comment.service';

@Component({
  moduleId: module.id,
  selector: 'test-services',
  templateUrl: 'test-services.component.html'
})

export class TestServicesComponent {
  private result: any;
  private projects: any[];
  private words: any[];

  private currentProjectId: string;
  private currentProjectName: string;

  constructor(private lfApiService: LfApiService, private projectService: ProjectService, private commentService: CommentService) {
    this.lfApiService.getUserProfile().subscribe (response => {
      this.result = response.data;
      console.log(this.result);
      this.getProjects();
    });
  }

  getProjects() {
    this.projectService.getProjectList().subscribe(response =>{
      this.projects = response.entries; 
      this.currentProjectId = this.projects[0].id;
      this.currentProjectName = this.projects[0].projectName;
      console.log("projects");
      console.log(this.projects);
      this.getWords();
    });
  }

  getWords() {
    this.projectService.getWordList(this.currentProjectId).subscribe(response =>{
      this.words = response.entries;
      console.log(this.words);
    });
  }

  setProject(id: string, name: string){
    this.currentProjectId = id;
    this.currentProjectName = name;
    this.getWords();
  }

  sendComment(comment: string, wordId: string) {
    this.commentService.sendComment(comment, wordId).subscribe(response => {
      console.log("--Comment Response--");
      console.log(response);
    });
  }
}
