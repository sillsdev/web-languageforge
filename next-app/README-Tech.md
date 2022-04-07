# README, the technical version

## Architectural diagram

![image](https://user-images.githubusercontent.com/4412848/158890929-7042b002-5759-4de6-ac6a-3e55c29d440e.png)

## Technology stack

* [Svelte](https://svelte.dev/) – Language abstraction for UI that compiles to small, performant, vanilla JavaScript
* [daisyUI](https://daisyui.com/) – Pre-designed UI componentry
* [Tailwindcss](https://tailwindcss.com/) – CSS utils for class slinging in the (Svelte) UI
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

