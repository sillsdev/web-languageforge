FROM node:10
# Note: we cannot use node:10-alpine because the npm package node-sass is compiled using gcc and
# the setup looks way too complicated.  Let's stick with the official node:10 package even though
# it's a large image

RUN npm install --no-optional -g gulp-cli

# Pull in Language Forge git repo src folder
RUN mkdir -p /data
COPY . /data

WORKDIR /data
RUN npm install --no-optional

# QUESTION: can we share a node_modules between containers that lives in src/node_modules but not have that exposed to the host?

# QUESTION: what about the gulp sass project that generates css files all over the source tree?
# perhaps this should not be run in the image, but be run only when the container starts up, since it will modify the source directory on the host?
#RUN gulp sass
CMD ["gulp", "webpack-lf:watch"]

# TODO figure out how to run both "gulp sass:watch" and "gulp webpack-lf:watch" - alas, do these need to be separate containers too?
# unfortunately we have two compilation services, sass and webpack, each with their own watch service

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
