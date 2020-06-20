FROM node:14.4.0-alpine3.12

COPY . /var/duanwu/

USER nobody

WORKDIR /var/duanwu/

RUN npm install

EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]
