# UI-BUILDER
FROM node:14.16.1-alpine3.11 AS ui-builder-base

# install npm globally
RUN npm config set unsafe-perm true && npm install -g npm@7.6.3

RUN mkdir -p /data
WORKDIR /data

# unsafe-perm true is required to work around an npm bug since we are running as root, have a git+HTTPS repo source and it has a `prepare` script (perfect storm).
# see https://github.com/npm/npm/issues/17346
COPY package.json package-lock.json ./
RUN npm config set unsafe-perm true && npm install --legacy-peer-deps

# Copy in files needed for compilation, located in the repo root
COPY typings ./typings/
COPY webpack.config.js webpack-dev.config.js webpack-prd.config.js tsconfig.json tslint.json ./

# copy in src local files
COPY src/angular-app ./src/angular-app
COPY src/appManifest ./src/appManifest
COPY src/js ./src/js
COPY src/json ./src/json
COPY src/sass ./src/sass
COPY src/service-worker ./src/service-worker
COPY src/Site/views ./src/Site/views

FROM ui-builder-base AS production-ui-builder
ENV NPM_BUILD_SUFFIX=prd

FROM ui-builder-base AS development-ui-builder
ENV NPM_BUILD_SUFFIX=dev

FROM development-ui-builder AS ui-builder
# artifacts built to /data/src/dist
RUN npm run build:${NPM_BUILD_SUFFIX}

# make wait available for container ochestration
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait

COPY docker/test-e2e/run.sh /run.sh

# copy in test folder
COPY test/ /data/test/

RUN npm run compile-test-e2e

CMD ["/run.sh"]
