import { Injectable } from '@angular/core';
import Coordinator, { RequestStrategy, SyncStrategy } from '@orbit/coordinator';
import {
  FindRecordsTerm, Operation, QueryOrExpression, Record, RecordIdentity, Schema, SchemaSettings, TransformOrOperations
} from '@orbit/data';
import JSONAPISource from '@orbit/jsonapi';
import Store from '@orbit/store';
import { Dict } from '@orbit/utils';
import { OAuthService } from 'angular-oauth2-oidc';
import { ObjectId } from 'bson';
import dcopy from 'deep-copy';

@Injectable({
  providedIn: 'root'
})
export class JSONAPIService {
  private readonly schemaDefinition: SchemaSettings = {
    generateId: () => new ObjectId().toHexString(),
    models: {
      user: {
        attributes: {
          username: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' }
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

  constructor(private readonly oauthService: OAuthService) {
    this.schema = new Schema(this.schemaDefinition);

    this.store = new Store({ schema: this.schema });

    this.remote = new JSONAPISource({
      schema: this.schema,
      name: 'remote',
      host: window.location.origin,
      namespace: 'api'
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

  init(): Promise<void> {
    return this.coordinator.activate();
  }

  get<T extends Record>(resource: RecordIdentity): Promise<T> {
    return this._query(q => q.findRecord(resource));
  }

  getRelated<T extends Record>(resource: RecordIdentity, relationship: string): Promise<T> {
    return this._query(q => q.findRelatedRecord(resource, relationship));
  }

  getAll<T extends Record>(type: string, expressionBuilder = (t: FindRecordsTerm) => t): Promise<T[]> {
    return this._query(q => expressionBuilder(q.findRecords(type)));
  }

  getAllRelated<T extends Record>(resource: RecordIdentity, relationship: string): Promise<T[]> {
    return this._query(q => q.findRelatedRecords(resource, relationship));
  }

  private async _query(queryOrExpression: QueryOrExpression): Promise<any> {
    const result = await this.store.query(queryOrExpression, this.getOptions());
    return dcopy(result);
  }

  create(resource: Record): Promise<void> {
    this.schema.initializeRecord(resource);
    return this._update(t => t.addRecord(dcopy(resource)));
  }

  replace(resource: Record): Promise<void> {
    return this._update(t => t.replaceRecord(dcopy(resource)));
  }

  async update<T extends Record>(resource: RecordIdentity, attrs: Dict<any>): Promise<T> {
    await this._update(t => {
      const ops: Operation[] = [];
      for (const [name, value] of Object.entries(attrs)) {
        ops.push(t.replaceAttribute(resource, name, value));
      }
      return ops;
    });
    return this.getCached(resource);
  }

  delete(resource: RecordIdentity): Promise<void> {
    return this._update(t => t.removeRecord(resource));
  }

  async addRelated<T extends Record>(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<T> {
    await this._update(t => t.addToRelatedRecords(resource, relationship, related));
    return this.getCached(resource);
  }

  async removeRelated<T extends Record>(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<T> {
    await this._update(t => t.removeFromRelatedRecords(resource, relationship, related));
    return this.getCached(resource);
  }

  async replaceAllRelated<T extends Record>(resource: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<T> {
    await this._update(t => t.replaceRelatedRecords(resource, relationship, related));
    return this.getCached(resource);
  }

  async setRelated<T extends Record>(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<T> {
    await this._update(t => t.replaceRelatedRecord(resource, relationship, related));
    return this.getCached(resource);
  }

  private _update(transformOrOperations: TransformOrOperations): Promise<void> {
    return this.store.update(transformOrOperations, this.getOptions());
  }

  private getCached<T extends Record>(resource: RecordIdentity): T {
    return dcopy(this.store.cache.query(q => q.findRecord(resource)));
  }

  private getOptions(): any {
    return {
      sources: {
        remote: {
          settings: {
            headers: {
              'Authorization': 'Bearer ' + this.oauthService.getAccessToken()
            }
          }
        }
      }
    };
  }
}
