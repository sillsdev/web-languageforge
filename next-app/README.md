# LFNext app

## Local development

From within the `/docker` directory, `make next-dev` will start the proxy as well as the legacy and next apps.  The proxy listens on `:80` and will route requests to the appropriate app, therefore navigating to http://locahost will bring up the legacy app.  `admin` and `password` can be used to login.  Choosing the "Change password" option in the dropdown will get you routed over to the next app.  Changes to the next-app files will be immediately reflected in the browser.

### Alternate local development (limited)

From within the `/next-app` directory, `npm run dev` will also start the next app and the root page can be used for simple testing, i.e., http://localhost:3000/.  This approach is limited in that the backend will not be started so all development must be isolated to pages without a required backend call.


## Local preview

From within the `/docker` directory, `make next` will start the proxy as well as the legacy and next apps.  The proxy listens on `:80` and will route requests to the appropriate app, therefore navigating to http://locahost will bring up the legacy app.  `admin` and `password` can be used to login.  Choosing the "Change password" option in the dropdown will get you routed over to the next app.  Changes to the next-app files will not be picked up as they were in the "dev" case above.  Additionally, the preview will be an exact reflection of how the app will run in a deployed infrastructure.

