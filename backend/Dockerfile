FROM node:20-alpine

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
