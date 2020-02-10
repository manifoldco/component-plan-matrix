FROM node:13-alpine as builder

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ADD . /usr/src/app
RUN npm install
RUN NODE_ENV=production npm run build
