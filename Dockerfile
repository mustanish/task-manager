## Stage 1 (base)
FROM node:alpine as base
LABEL org.opencontainers.image.authors=mustanish.altamash@gmail.com
LABEL org.opencontainers.image.title="taskmanager"
LABEL org.opencontainers.image.source=https://github.com/mustanish/task-manager
LABEL org.opencontainers.image.licenses=UNLICENSED
LABEL com.taskmanager.nodeversion=$NODE_VERSION
WORKDIR /usr/src/taskmanager
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