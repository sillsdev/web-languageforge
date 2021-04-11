FROM node:14-alpine

# Expose Live-Reload port
#EXPOSE 35729

# install npm globally
RUN npm config set unsafe-perm true && npm install -g npm@7.6.3

RUN mkdir -p /data
WORKDIR /data

# npm install
# unsafe-perm is required to work around an npm bug since we are running as root and also have a git+HTTPS repo source.
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

# artifacts built to /data/src/dist
RUN npm run build:dev
