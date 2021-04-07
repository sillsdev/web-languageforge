# This assumes a .env file that looks something like this:
# PORT=3000
# MYSQL_HOST=localhost
# MYSQL_USER=mysqlusername
# MYSQL_PASSWORD=mysqlpassword
# MYSQL_DATABASE=testldapi
# MYSQL_DATABASE_PRIVATE=testldapipvt

# Step 1: Build app
FROM node:14.15.4-alpine AS builder
RUN npm i -g pnpm@6
WORKDIR /git
ADD https://github.com/sillsdev/web-languagedepot-api/tarball/nodejs ./
# Github tarball has top-level directory USER-REPO-HASH, and HASH is unpredictable ahead of time, so we rename it
RUN tar xvzf nodejs && rm nodejs && mv sillsdev-web-languagedepot-api-* ldapi
WORKDIR /git/ldapi
RUN pnpm i --frozen-lockfile
RUN pnpm run build

# Step 2: Create minimal container with running app
FROM node:14.15.4-alpine
COPY --from=builder /usr/local/lib/node_modules/pnpm /usr/local/lib/node_modules/pnpm
RUN ln -s ../lib/node_modules/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm && \
    ln -s ../lib/node_modules/pnpm/bin/pnpx.cjs /usr/local/bin/pnpx
WORKDIR /app
COPY --from=builder /git/ldapi/static assets
COPY --from=builder /git/ldapi/package.json /git/ldapi/pnpm-lock.yaml ./
RUN pnpm i --prod --frozen-lockfile
COPY --from=builder /git/ldapi/build ./
EXPOSE 3000
USER node
ENTRYPOINT ["node", "index.js"]
