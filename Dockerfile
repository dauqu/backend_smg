FROM node:alpine
WORKDIR /app
COPY . .
RUN npm install
RUN apk update && apk upgrade && apk add --no-cache bash
CMD [ "sh", "-c", "npm start" ]
