# LFNext app

## Local development

Once you've created a project and installed dependencies with `npm install` start a development server:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

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
