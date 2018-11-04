const offlineUrl = '/offline.html';
workbox.precaching.precacheAndRoute([
  offlineUrl
]);

const appRouteHandler = workbox.strategies.networkOnly();
workbox.routing.registerRoute(
  new RegExp(/(app|auth)/g), (args) =>
    appRouteHandler.handle(args)
      .then(response => {
        if (!response || response.status === 404) {
          return caches.match(offlineUrl);
        }

        return response;
      }).catch(error => caches.match(offlineUrl)));
