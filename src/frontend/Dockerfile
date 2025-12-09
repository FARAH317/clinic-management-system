# frontend/Dockerfile
FROM node:20

WORKDIR /app

# Copier package.json et package-lock.json
COPY package.json package-lock.json ./

RUN npm install

# Copier tout le code source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
