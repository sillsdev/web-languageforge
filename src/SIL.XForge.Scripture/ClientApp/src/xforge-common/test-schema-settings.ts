import { SchemaSettings } from '@orbit/data';

export const TEST_SCHEMA_SETTINGS: SchemaSettings = {
  models: {
    user: {
      attributes: {
        username: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
        canonicalEmail: { type: 'string' },
        emailVerified: { type: 'boolean' },
        googleId: { type: 'string' },
        password: { type: 'string' },
        paratextId: { type: 'string' },
        active: { type: 'boolean' },
        avatarUrl: { type: 'string' },
        role: { type: 'string' },
        mobilePhone: { type: 'string' },
        contactMethod: { type: 'string' },
        birthday: { type: 'date' },
        gender: { type: 'string' },
        site: { type: 'object' }
      },
      relationships: {
        projects: { type: 'hasMany', model: 'projectUser', inverse: 'user', dependent: 'remove' }
      }
    },
    project: {
      attributes: {
        projectName: { type: 'string' },
        inputSystem: { type: 'object' },
        num: { type: 'number' }
      },
      relationships: {
        users: { type: 'hasMany', model: 'projectUser', inverse: 'project', dependent: 'remove' }
      }
    },
    projectUser: {
      attributes: {
        role: { type: 'string' },
        name: { type: 'string' }
      },
      relationships: {
        user: { type: 'hasOne', model: 'user', inverse: 'projects' },
        project: { type: 'hasOne', model: 'project', inverse: 'users' }
      }
    }
  }
};
