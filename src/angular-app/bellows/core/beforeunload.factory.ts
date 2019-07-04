export function beforeUnload($rootScope: any, $window: Window) {
  $window.onbeforeunload = () => {
    // Some browsers have disabled custom confirmation messages
    const message = 'Changes you made may not be saved.';
    const event = $rootScope.$broadcast('beforeUnload');
    if (event.defaultPrevented) {
      return message;
    }
  };

  $window.onunload = () => {
      $rootScope.$broadcast('unload');
  };
  return {};
}
