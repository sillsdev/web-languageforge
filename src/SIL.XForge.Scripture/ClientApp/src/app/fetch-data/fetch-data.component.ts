import { Component } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import Coordinator, { RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import { Schema, SchemaSettings, Record } from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';
import Store from '@orbit/store';

@Component({
  selector: 'app-fetch-data',
  templateUrl: './fetch-data.component.html'
})
export class FetchDataComponent {
  private readonly schemaDefinition: SchemaSettings = {
    models: {
      user: {
        attributes: {
          username: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' }
        },
        relationships: {
          projects: { type: 'hasMany', model: 'project' }
        }
      },
      project: {
        attributes: {
          projectName: { type: 'string' },
          projectCode: { type: 'string' },
          config: { type: 'object' }
        },
        relationships: {
          owner: { type: 'hasOne', model: 'user' }
        }
      }
    }
  };

  private readonly schema: Schema;
  private readonly store: Store;
  private readonly remote: JSONAPISource;
  private readonly coordinator: Coordinator;
  private readonly updatedNames: Map<string, string> = new Map<string, string>();

  public projects: Record[];

  constructor(oauthService: OAuthService) {
    this.schema = new Schema(this.schemaDefinition);

    this.store = new Store({ schema: this.schema });

    this.remote = new JSONAPISource({
      schema: this.schema,
      name: 'remote',
      host: window.location.origin,
      namespace: 'api',
      defaultFetchHeaders: {
        'Authorization': 'Bearer ' + oauthService.getAccessToken()
      }
    });

    this.coordinator = new Coordinator({
      sources: [this.store, this.remote],
      strategies: [
        // Query the remote server whenever the store is queried
        new RequestStrategy({
          source: 'store',
          on: 'beforeQuery',

          target: 'remote',
          action: 'pull',

          blocking: true
        }),
        // Update the remote server whenever the store is updated
        new RequestStrategy({
          source: 'store',
          on: 'beforeUpdate',

          target: 'remote',
          action: 'push',

          blocking: true
        }),
        // Sync all changes received from the remote server to the store
        new SyncStrategy({
          source: 'remote',
          target: 'store',
          blocking: true
        })
      ]
    });
  }

  get isDirty(): boolean {
    return this.updatedNames.size > 0;
  }

  async ngOnInit(): Promise<void> {
    await this.coordinator.activate();
    this.projects = await this.store.query(q => q.findRecords('project'));
  }

  updateProjectName(project: Record, value: string): void {
    if (project.attributes.projectName === value) {
      return;
    }
    project.attributes.projectName = value;
    this.updatedNames.set(project.id, value);
  }

  update(): void {
    this.store.update(t => {
      const ops = [];
      for (const update of this.updatedNames) {
        ops.push(t.replaceAttribute({ type: 'project', id: update[0] }, 'projectName', update[1]));
      }
      return ops;
    });
    this.updatedNames.clear();
  }
}
