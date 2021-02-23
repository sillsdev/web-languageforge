FROM node:10
# Note: we cannot use node:10-alpine because the npm package node-sass is compiled using gcc and
# the setup looks way too complicated.  Let's stick with the official node:10 package even though
# it's a large image


# copy in src files
RUN mkdir -p /data
WORKDIR /data
COPY src /data/src/

# Copy in files needed for compilation, located in the repo root
COPY typings /data/typings/
COPY gulpfile.js webpack.config.js \
package.json package-lock.json tsconfig.json tslint.json /data/

# npm install
# unsafe-perm is required to work around an npm bug since we are running as root and also have a git+HTTPS repo source.
# see https://github.com/npm/npm/issues/17346
RUN npm config set unsafe-perm true && npm install -g gulp-cli && npm install

# Live Reload
EXPOSE 35729

CMD ["gulp", "sass:watch", "webpack-lf:watch"]
