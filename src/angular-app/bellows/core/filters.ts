import * as moment from 'moment';

export type BytesFilterFunction = (bytes: any, precision?: number) => string;

export function BytesFilter(): BytesFilterFunction {
  return (bytes: any, precision?: number): string => {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    const value = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(value))).toFixed(precision) + ' ' + units[value];
  };
}

export type RelativeTimeFilterFunction = (timestamp?: string, timeFormat?: string) => string;

export function RelativeTimeFilter(): RelativeTimeFilterFunction {
  return (timestamp?: string, timeFormat?: string): string => {
    // see http://momentjs.com/docs/
    const timeAgo = moment(timestamp, timeFormat);
    if (timeAgo.isValid()) {
      return timeAgo.fromNow();
    }
    return '';
  };
}

export type EncodeURIFilterFunction = (input: string) => string;
export function EncodeURIFilter($window: angular.IWindowService): EncodeURIFilterFunction {
  return (input: string): string => {
    if (input) {
      return $window.encodeURIComponent(input);
    }
    return '';
  };
}
