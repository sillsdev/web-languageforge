FROM node:alpine

WORKDIR /app

COPY package.json package-lock.json svelte.config.js /app
COPY src /app/src
COPY static /app/static

RUN npm install

EXPOSE 3000
