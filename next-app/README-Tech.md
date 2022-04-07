# README, the technical version

## Architectural diagram

![image](https://user-images.githubusercontent.com/4412848/158890929-7042b002-5759-4de6-ac6a-3e55c29d440e.png)

## Migration strategy

Migration will occur on a capability-by-capability basis, e.g., "Change password" is the first capability to be migrated from the legacy implementation to the new one.

This is being done through the use of a Proxy, concretely speaking, [Caddy](https://github.com/caddyserver/caddy) in our stack.

Migrating legacy routes will be accomplished through rules established in the Proxy, i.e., the `/docker/next-app/Caddyfile`.

**Change password data flow example:**
1. request for the legacy route, `/app/changepassword`, comes into the Proxy and the following rules are encountered:

> ```
> @next_app_paths {
> 	path /_app/*
> 	path /app/changepassword
> 	path /password*
> }
> route @next_app_paths {
> 	rewrite /app/changepassword /password/change
> 	reverse_proxy {$NEXT_APP}
> }
>
> reverse_proxy {$LEGACY_APP}
> ```

2. `/app/changepassword` will match `@next_app_paths` and the request will be rewritten **internally** to `/password/change` and sent to the Next App for handling.

> Rewriting this internally does two things, it leaves the user's original URL intact and it also allows the Next App to maintain a sensible and flexible routing structure in isolation, i.e., none of the legacy choices in routes need to pollute the design in the Next App.

3. This incoming route will be handled by the Next App and the response will be returned back through the Proxy and eventually to the end user.

> Handling requests through the proxy in this way allows us to avoid CORS handling in the Legacy App's PHP backend as well as avoiding additional certificate management.

## Technology stack for Next App

* [Svelte](https://svelte.dev/) – Language abstraction for UI that compiles to small, performant, vanilla JavaScript
* [daisyUI](https://daisyui.com/) – Pre-designed UI componentry
* [Tailwindcss](https://tailwindcss.com/) – CSS utils for class slinging in the (Svelte) UI (as well as the foundation for daisyUI)
* [SvelteKit](https://kit.svelte.dev/) – Javascript backend supporting SSG, SSR, and client-side hydration

## Technical design notes

### Project structure

```
src
├── lib (shared functionality)
├── routes (views and backend call handlers)
```

#### `lib`

> Code under `lib` is being organized by shared functionality, e.g., `error` holds a UI component, `Error.svelte` as well as an `index.js` since error handling involves both UI and a shared API for the rest of the app.  Using `index.js` gives consumers a little syntactic sugar to import `$lib/error`, e.g., `import { throwError } '$lib/error'`.  As a matter of practice, code can begin stand-alone in the root of this folder until there's a need to organize things under a more cohesive folder.  This practice should help keep the root tidy.

#### `routes`

> Code under `routes` represents the views as well as any backend calls, refer to https://kit.svelte.dev/docs/routing for further details.


### UI design

### Tailwindcss

Of course choosing tailwindcss comes with a number of criticisms but we believe it's a good choice for the following reasons:

1. The codebase can be kept free of class clutter by simply utlizing `@apply` in the `<style>` section of our `.svelte` files.
2. We will inevitably have situations where parent compoponents or views will want to pass styles down to children.  This is very common and requires writing global classes anyway.  Using something like tailwindcss or bootstrap takes all of that work off of our plate.  Unused CSS will still get purged by the compiler so the app doesn't take on unnecessary bloat.
3. daisyUI is built upon tailwindcss anyway so we benefit from using it in both situations.

[ ] Confirm no additional configuration is required to purge unused CSS.

### daisyUI

With such a small team, we were always going to need a well thought-out UI library to keep us from having to make a bunch of design decisions along the way.  While there are a handful of Svelte-based libraries, none of them met the crtieria necessary to help make our team as efficient as possible.  There were many mature UI systems already in place built upon Tailwindcss and daisyUI represents one of the best of the ones we looked at in it's goal of further simplifying the use of Tailwindcss.  Additionally, daisyUI has already integrated many best practices and opinions in its design decisions.

