FROM node:22-alpine

RUN npm install -g mint

WORKDIR /app

COPY . .

EXPOSE 3000

CMD ["mint", "dev"]
