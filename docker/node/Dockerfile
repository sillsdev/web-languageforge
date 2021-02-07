FROM node:10
# Note: we cannot use node:10-alpine because the npm package node-sass is compiled using gcc and
# the setup looks way too complicated.  Let's stick with the official node:10 package even though
# it's a large image

RUN mkdir -p /data
WORKDIR /data
COPY package.json package-lock.json webpack.config.js tsconfig.json tslint.json gulpfile.js /data/

# unsafe-perm is required to work around an npm bug since we are running as root and also have a git+HTTPS repo source.
# see https://github.com/npm/npm/issues/17346
RUN npm config set unsafe-perm true && npm install -g gulp-cli && npm install

COPY src /data
COPY typings /data

# Live Reload
EXPOSE 35729

CMD ["gulp", "sass:watch", "webpack-lf:watch"]

# here are the gulp tasks names:

# sass
# sass:watch
# webpack-lf
# webpack-lf:watch

# Typescript Karma tests
# test-ts-lf
# test-ts-lf:watch

# Typescript E2E Protractor tests
# test-e2e-compile
# test-e2e-compile:watch
