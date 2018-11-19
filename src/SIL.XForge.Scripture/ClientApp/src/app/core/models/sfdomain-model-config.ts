import { DomainModelConfig } from '@xforge-common/models/domain-model';
import { SFProject, SFProjectRef, SFProjectUser, SFProjectUserRef, SFUser, SFUserRef, SyncJob, SyncJobRef } from './sfproject.generated';
import { Text, TextRef } from './text';
import { TextData } from './text-data';

// All resource, resource ref, and realtime doc types should be added to this config.
export const SFDOMAIN_MODEL_CONFIG: DomainModelConfig = {
  resources: [SFProject, SFProjectUser, SFUser, SyncJob, Text],
  resourceRefs: [SFProjectRef, SFProjectUserRef, SFUserRef, SyncJobRef, TextRef],
  realtimeDocs: [TextData]
};
