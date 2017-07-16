FROM node:latest

RUN npm install --global nodemon

RUN mkdir /capstone
WORKDIR /capstone
RUN mkdir logs

COPY package.json /capstone
COPY index.js /capstone
COPY app /capstone/app
RUN npm install

EXPOSE 3001

CMD ["npm", "start"]
