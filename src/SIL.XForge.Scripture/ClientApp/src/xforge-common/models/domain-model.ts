import { RealtimeDataConstructor } from './realtime-data';
import { ResourceConstructor, ResourceRefConstructor } from './resource';

export interface DomainModelConfig {
  resourceTypes: ResourceConstructor[];
  resourceRefTypes: ResourceRefConstructor[];
  realtimeDataTypes: RealtimeDataConstructor[];
}

/**
 * This class is used to register all domain model classes so that {@link JSONAPIService} and {@link RealtimeService}
 * can create them dynamically. All {@link Resource}, {@link ResourceRef}, and {@link RealtimeDoc} classes should be
 * included in the configuration. This class should be registered with the Angular DI container.
 */
export class DomainModel {
  private readonly resourceTypes: Map<string, ResourceConstructor>;
  private readonly resourceRefTypes = new Map<string, ResourceRefConstructor>();
  private readonly realtimeDataTypes = new Map<string, RealtimeDataConstructor>();

  constructor(settings: DomainModelConfig) {
    this.resourceTypes = this.createMap(settings.resourceTypes);
    this.resourceRefTypes = this.createMap(settings.resourceRefTypes);
    this.realtimeDataTypes = this.createMap(settings.realtimeDataTypes);
  }

  getResourceType(recordType: string): ResourceConstructor {
    return this.resourceTypes.get(recordType);
  }

  getResourceRefType(recordType: string): ResourceRefConstructor {
    return this.resourceRefTypes.get(recordType);
  }

  getRealtimeDataType(recordType: string): RealtimeDataConstructor {
    return this.realtimeDataTypes.get(recordType);
  }

  private createMap(models: any[]): Map<string, any> {
    return new Map<string, any>(models.map(r => [r.TYPE, r] as [string, any]));
  }
}
