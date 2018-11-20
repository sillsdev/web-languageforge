// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --prod` then `environment.prod.ts` will be used instead. And if you do
// `ng build --configuration=pwaTest` then `environment.pwa-test.ts` will be used instead.
// The list of which env maps to which file can be found in `angular.json`.

export const environment = {
  production: false,
  pwaTest: false,
  issueEmail: 'issues@beta.qa.scriptureforge.org',
  siteName: 'Scripture Forge',
  siteOrigin: 'http://localhost:5000',
  realtimePort: 5002,
  realtimeUrl: '/'
};
