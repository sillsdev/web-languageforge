FROM node:16.14.0-alpine3.15

RUN mkdir -p /data
WORKDIR /data

COPY package.json ./
COPY node_modules ./node_modules/

# Copy in files needed for compilation, located in the repo root
COPY typings ./typings/
COPY webpack.config.js webpack-dev.config.js webpack-prd.config.js tsconfig.json tslint.json ./

# copy in src local files
COPY src/angular-app ./src/angular-app
COPY src/appIcons ./src/appIcons
COPY src/manifest.json ./src/manifest.json
COPY src/json ./src/json
COPY src/sass ./src/sass
COPY src/Site/views ./src/Site/views

CMD npm run build:dev:watch
