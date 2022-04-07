# LFNext app

## Local development

From within the `/docker` directory, `make next-dev` will start the proxy as well as the legacy and next apps.  The proxy listens on `:80` and will route requests to the appropriate app, therefore navigating to http://locahost will bring up the legacy app.  `admin` and `password` can be used to login.  Choosing the "Change password" option in the dropdown will get you routed over to the next app.  Changes to the next-app files will be immediately reflected in the browser.


## Local preview

From within the `/docker` directory, `make next` will start the proxy as well as the legacy and next apps.  The proxy listens on `:80` and will route requests to the appropriate app, therefore navigating to http://locahost will bring up the legacy app.  `admin` and `password` can be used to login.  Choosing the "Change password" option in the dropdown will get you routed over to the next app.  Changes to the next-app files will not be picked up as they were in the "dev" case above.  Additionally, the preview will be an exact reflection of how the app will run in a deployed infrastructure.

## Capabilities

### Change password

Current url: `/app/changepassword`

* Should a user with an oauth authn be seeing this page?
* Is there a way to detect how a user is authn, i.e., email or oauth-based?
* Should we be asking them to "confirm" their password anymore?

Possible use cases:
1. Authenticated user (email-based) successfully changes their password
1. Authenticated user (oauth-based) visits page (or attempts to change password)...
1. Guest visits page...
1. Authenticated user is not able to change their password...

#### Authenticated user (email-based) successfully changes their password (UC 1)
1. Authenticated user (email-based) logs in on legacy app
1. Chooses "Change Password" from existing dropdown
1. Fills out form on next app
1. Submits form on next app
> ```js
> POST /api/sf
> {
>     "version":"2.0",
>     "method":"change_password",
>     "params": {
>         "orderedParams":
>             [
>                 "611bb9ecf88b8b192254a012",  //TODO: not sure yet where to get this from, probably a user ID
>                 "user-entered-password"
>             ]
>     },
>     "id":3
> }
>
> headers.cookie: PHPSESSID
> ```
5. Upon receiving `200`, the current impl shows user a success message, empties the form and disables the button
