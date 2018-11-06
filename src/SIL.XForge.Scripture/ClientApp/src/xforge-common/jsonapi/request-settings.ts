import { Query, Source, Transform } from '@orbit/data';
import { clone, deepGet, deepMerge, deepSet, deprecate, isArray } from '@orbit/utils';

export interface Filter {
  [filterOn: string]: any;
}

export interface RequestOptions {
  filter?: Filter[];
  sort?: any;
  page?: any;
  include?: any;
  settings?: any;
  transformOptions?: any;
}

export function customRequestOptions(source: Source, queryOrTransform: Query | Transform): RequestOptions {
  return deepGet(queryOrTransform, ['options', 'sources', source.name]);
}

export function buildFetchSettings(options: RequestOptions = {}, customSettings?: any): any {
  const settings = options.settings ? clone(options.settings) : {};

  if (customSettings) {
    deepMerge(settings, customSettings);
  }

  ['filter', 'include', 'page', 'sort'].forEach(param => {
    if (options[param]) {
      let value = options[param];
      if (param === 'include' && isArray(value)) {
        value = value.join(',');
      }

      deepSet(settings, ['params', param], value);
    }
  });

  if (options['timeout']) {
    deprecate('JSONAPI: Specify `timeout` option inside a `settings` object.');
    settings.timeout = options['timeout'];
  }

  return settings;
}
