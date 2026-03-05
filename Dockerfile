FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Generate dummy data once building the container
# RUN npm run seed

EXPOSE 8080

CMD ["npm", "start"]
