import * as moment from 'moment';

export interface BytesFilterFunction { (bytes: any, precision?: number): string }

export function BytesFilter(): BytesFilterFunction {
  return (bytes: any, precision?: number): string => {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    let number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  };
}

export interface RelativeTimeFilterFunction { (timestamp?: string, timeFormat?: string): string }

export function RelativeTimeFilter(): RelativeTimeFilterFunction {
  return (timestamp?: string, timeFormat?: string): string => {
    // see http://momentjs.com/docs/
    let timeAgo = moment(timestamp, timeFormat);
    if (timeAgo.isValid()) {
      return timeAgo.fromNow();
    }
    return '';
  };
}
