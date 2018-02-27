export type SecondsToTimeFilterFunction = (seconds: number) => string;

export function SecondsToTimeFilter(): SecondsToTimeFilterFunction {
  // see https://stackoverflow.com/questions/28394572/angularjs-seconds-to-time-filter
  function padTime(t: number) {
    return t < 10 ? '0' + t : t;
  }

  return (seconds: number) => {
    if (seconds < 0) {
      return '0:00:00';
    }

    const _hours = Math.floor(seconds / 3600);
    const _minutes = Math.floor((seconds % 3600) / 60);
    const _seconds = Math.floor(seconds % 60);

    return _hours + ':' + padTime(_minutes) + ':' + padTime(_seconds);
  };
}
