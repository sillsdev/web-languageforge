import { FilterSpecifier, Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

/**
 * The type for a custom filter function.
 *
 * @param {Record[]} records The records to filter.
 * @param {any} value The value to filter on.
 * @param {FilterSpecifier[]} prevFilters The filters that have already been executed. This can be useful to determine
 * if an index that was built on a previous set of records should be invalidated. If the filters have changed since
 * the index was built, then the input records are probably also different.
 */
export type CustomFilter = (records: Record[], value: any, prevFilters: FilterSpecifier[]) => Record[];

const customFilters: Dict<Dict<CustomFilter>> = {};

export function registerCustomFilter(type: string, name: string, filter: CustomFilter): void {
  let typeFilters = customFilters[type];
  if (typeFilters == null) {
    typeFilters = {};
    customFilters[type] = typeFilters;
  }
  typeFilters[name] = filter;
}

export function getCustomFilter(type: string, name: string): CustomFilter {
  const typeFilters = customFilters[type];
  if (typeFilters != null) {
    const filter = typeFilters[name];
    if (filter != null) {
      return filter;
    }
  }
  return null;
}

export function applyCustomFilter(
  type: string,
  name: string,
  records: Record[],
  value: any,
  prevFilters: FilterSpecifier[]
): Record[] {
  const customFilter = getCustomFilter(type, name);
  return customFilter(records, value, prevFilters);
}

export function isCustomFilterRegistered(type: string, name: string): boolean {
  const typeFilters = customFilters[type];
  if (typeFilters != null) {
    const filter = typeFilters[name];
    return filter != null;
  }
  return false;
}

export interface CustomFilterSpecifier extends FilterSpecifier {
  op: undefined;
  kind: 'custom';
  name: string;
  value: any;
}
