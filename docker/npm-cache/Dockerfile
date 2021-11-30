FROM node:14.16.1-alpine3.11
COPY package.json package-lock.json ./
RUN npm config set unsafe-perm true && npm install -g npm@7.6.3
RUN npm config set unsafe-perm true && npm install --legacy-peer-deps
