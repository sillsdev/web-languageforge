FROM node:22.2.0-alpine3.18

WORKDIR /app

COPY tsconfig.json pnpm-lock.yaml package.json postcss.config.cjs svelte.config.js vite.config.js tailwind.config.cjs /app/
COPY src /app/src
COPY static /app/static

RUN corepack enable
RUN pnpm install

EXPOSE 3000
