# UI-BUILDER
FROM node:16.14.0-alpine3.15

RUN mkdir -p /data
WORKDIR /data

COPY package.json ./
COPY node_modules ./node_modules/

# Copy in files needed for compilation, located in the repo root
COPY typings ./typings/
COPY tsconfig.json tslint.json ./

# copy in src local files
COPY src/angular-app ./src/angular-app
COPY src/appManifest ./src/appManifest
COPY src/js ./src/js
COPY src/json ./src/json
COPY src/sass ./src/sass
COPY src/Site/views ./src/Site/views

# make wait available for container ochestration
COPY --from=sillsdev/web-languageforge:wait-latest /wait /wait

COPY docker/test-e2e/run.sh /run.sh

# copy in test folder
COPY test/ /data/test/

RUN npm run compile-test-e2e

CMD ["/run.sh"]
