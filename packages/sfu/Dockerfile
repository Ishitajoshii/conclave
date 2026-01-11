FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 py3-pip make g++ py3-setuptools linux-headers

ENV PYTHON=/usr/bin/python3

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "start"]
