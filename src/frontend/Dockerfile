# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./

# Utiliser le registre officiel NPM (évite ECONNRESET)
RUN npm config set registry https://registry.npmjs.org/

# Installer les dépendances de manière fiable
RUN npm ci --legacy-peer-deps

# Copier le reste du code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
