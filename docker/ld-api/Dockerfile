# Should be built with `docker build . --tag ld-api`
# Then run with something like `docker run --init --env-file=.env --network=host ld-api:latest`
#
# This assumes a .env file that looks something like this:
# PORT=3000
# MYSQL_HOST=localhost
# MYSQL_USER=mysqlusername
# MYSQL_PASSWORD=mysqlpassword
# MYSQL_DATABASE=testldapi
# MYSQL_DATABASE_PRIVATE=testldapipvt

# Step 1: Check out source
FROM alpine AS git
RUN apk --update add git && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/*
RUN git clone --depth=1 https://github.com/sillsdev/web-languagedepot-api/ git

# Step 2: Build app
FROM node:14.15.4-alpine AS builder
WORKDIR /app
COPY --from=git /git/package*.json ./
RUN npm ci
COPY --from=git /git/static ./static/
COPY --from=git /git/svelte.config.js /git/snowpack.config.js /git/tsconfig.json ./
COPY --from=git /git/src ./src/
RUN npm run build && npm run adapt

# Step 3: Create minimal container with running app
FROM node:14.15.4-alpine
WORKDIR /app
COPY --from=git /git/static assets
COPY --from=git /git/package*.json ./
RUN npm ci
COPY --from=builder app/build ./
EXPOSE 3000
USER node
ENTRYPOINT ["node", "index.js"]
