FROM node:20

WORKDIR /myapp

COPY . .

RUN npm install

EXPOSE 4300

CMD [ "npm" , "start" ]


