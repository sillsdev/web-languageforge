# LFNext app

## Local development

See [Developer Guide](docs/DEVELOPER.md) for the quick start instructions.

### Alternate local development (full infrastructure)

From the project root directory, `make next-dev` and access app via http://localhost

### Alternate local development (limited)

From within the `/next-app` directory, `pnpm run dev` will also start the next app and the root page can be used for simple testing, i.e., http://localhost:3000/. This approach is limited in that the backend will not be started so all development must be isolated to pages without a required backend call.
