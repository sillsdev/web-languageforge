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
# yes, should be able to create a volume and simply share it between two containers:  https://docs.docker.com/compose/compose-file/compose-file-v3/#volumes & https://phoenixnap.com/kb/how-to-share-data-between-docker-containers

# QUESTION: what about the gulp sass project that generates css files all over the source tree?
# perhaps this should not be run in the image, but be run only when the container starts up, since it will modify the source directory on the host?
#RUN gulp sass
# this is a question of architecture...it sounds like something that's only needed during the bundling phase so I'd expect those files to be generated in a dist folder or a temp working directory, not part of the src directory.  Otherwise we'd need gitignore files to keep them from being checked-in.
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
