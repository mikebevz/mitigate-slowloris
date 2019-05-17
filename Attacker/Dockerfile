FROM node:11.9.0 as webapp-builder


RUN apt-get update && apt-get install -y apt-transport-https

ENV NPM_CONFIG_LOGLEVEL error

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

ARG TARGET_HOST=192.168.1.65
ENV TARGET_HOST $TARGET_HOST

ARG SOCKETS_NR=300
ENV SOCKETS_NR $SOCKETS_NR

RUN npm i -g yarn 

WORKDIR /usr/src/app

ADD package.json yarn.lock /tmp/
RUN cd /tmp && yarn
RUN mkdir -p /usr/src/app && cd /usr/src/app && ln -s /tmp/node_modules node_modules

COPY . /usr/src/app

# EXPOSE 3000

CMD ["yarn", "start"]

