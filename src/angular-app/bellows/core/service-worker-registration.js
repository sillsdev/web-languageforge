if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/dist/service-worker.js', { scope: '/' })
}
