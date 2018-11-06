import { RealtimeDocConstructor } from './realtime-doc';
import { ResourceConstructor, ResourceRefConstructor } from './resource';

export interface DomainModelConfig {
  resources: ResourceConstructor[];
  resourceRefs: ResourceRefConstructor[];
  realtimeDocs: RealtimeDocConstructor[];
}

/**
 * This class is used to register all domain model classes so that {@link JSONAPIService} and {@link RealtimeService}
 * can create them dynamically. All {@link Resource}, {@link ResourceRef}, and {@link RealtimeDoc} classes should be
 * included in the configuration. This class should be registered with the Angular DI container.
 */
export class DomainModel {
  private readonly resourceTypes: Map<string, ResourceConstructor>;
  private readonly resourceRefTypes = new Map<string, ResourceRefConstructor>();
  private readonly realtimeDocTypes = new Map<string, RealtimeDocConstructor>();

  constructor(settings: DomainModelConfig) {
    this.resourceTypes = this.createMap(settings.resources);
    this.resourceRefTypes = this.createMap(settings.resourceRefs);
    this.realtimeDocTypes = this.createMap(settings.realtimeDocs);
  }

  getResourceType(recordType: string): ResourceConstructor {
    return this.resourceTypes.get(recordType);
  }

  getResourceRefType(recordType: string): ResourceRefConstructor {
    return this.resourceRefTypes.get(recordType);
  }

  getRealtimeDocType(recordType: string): RealtimeDocConstructor {
    return this.realtimeDocTypes.get(recordType);
  }

  private createMap(models: any[]): Map<string, any> {
    return new Map<string, any>(models.map(r => [r.TYPE, r] as [string, any]));
  }
}
