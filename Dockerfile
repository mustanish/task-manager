## Stage 1 (base)
FROM node:alpine as base
LABEL org.opencontainers.image.authors=mustanish.altamash@gmail.com
LABEL org.opencontainers.image.title="groome"
LABEL org.opencontainers.image.source=https://github.com/mustanish/groome
LABEL org.opencontainers.image.licenses=UNLICENSED
LABEL com.groome.nodeversion=$NODE_VERSION
WORKDIR /usr/src/groome
COPY package.json yarn.lock* ./
EXPOSE 3000

## Stage 2 (development)
FROM base as dev
ENV NODE_ENV=development
RUN yarn install
CMD [ "yarn", "start:debug"]

## Stage 3 (default, production)
FROM base as prod
ENV NODE_ENV=production
COPY . .  
CMD ["node", "dist/main"]  