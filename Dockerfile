FROM node:14-alpine

RUN apk add coreutils

WORKDIR /code

COPY . .

RUN npm install
RUN npm install -g typescript
RUN npm install -g nodemon

ENTRYPOINT ["npm", "run", "app"]
