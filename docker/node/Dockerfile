FROM node:10
# Note: we cannot use node:10-alpine because the npm package node-sass is compiled using gcc and
# the setup looks way too complicated.  Let's stick with the official node:10 package even though
# it's a large image

RUN npm install --no-optional -g gulp-cli

RUN mkdir -p /data
RUN mkdir -p /dependencies
COPY package.json package-lock.json webpack.config.js tsconfig.json tslint.json gulpfile.js /dependencies/

WORKDIR /dependencies

# TODO --no-optional seems to have no effect on the fsevenevents warnings (irrelevant to the project but I don't like warnings)
RUN npm install --no-optional

# Live Reload
EXPOSE 35729

RUN gulp build-createWebsiteDefs

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
