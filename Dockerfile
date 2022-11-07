FROM node:14-alpine
WORKDIR /code
RUN apk add coreutils
COPY . .
RUN npm install
RUN npm install -g typescript
RUN npm install -g nodemon
EXPOSE 1111
ENTRYPOINT ["./wait-for", "mysql:3306", "--", "npm", "run", "app"]
