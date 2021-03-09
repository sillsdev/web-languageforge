FROM node:10
# Note: we cannot use node:10-alpine because the npm package node-sass is compiled using gcc and
# the setup looks way too complicated.  Let's stick with the official node:10 package even though
# it's a large image

# Expose Live-Reload port
EXPOSE 35729

# install Gulp globally
RUN npm config set unsafe-perm true && npm install -g gulp-cli

RUN mkdir -p /data
WORKDIR /data

# npm install
# unsafe-perm is required to work around an npm bug since we are running as root and also have a git+HTTPS repo source.
# see https://github.com/npm/npm/issues/17346
COPY package.json package-lock.json ./
RUN npm config set unsafe-perm true && npm install

# Copy in files needed for compilation, located in the repo root
COPY typings ./typings/
COPY gulpfile.js webpack.config.js tsconfig.json tslint.json ./

# copy in src files
COPY src ./src/

RUN gulp sass webpack-lf
