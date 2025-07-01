# Étape 1: Utiliser une image Node.js officielle comme base
FROM node:18-alpine

# Créer le répertoire de l'application dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers de dépendances. On les copie avant le reste
# pour profiter du cache de Docker si les dépendances ne changent pas.
COPY package*.json ./

# Installer les dépendances de l'application (production seulement)
RUN npm ci --only=production && npm cache clean --force

# Copier le reste du code source de l'application
COPY . .

# Exposer le port sur lequel le serveur tourne (d'après votre .env)
EXPOSE 3000

# La commande pour démarrer l'application
CMD [ "node", "server.js" ]