# --- Étape 1: Construction de l'application Angular ---
FROM node:18-alpine AS build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Étape 2: Servir l'application avec Nginx ---
FROM nginx:stable-alpine

# --- LA CORRECTION EST SUR CETTE LIGNE ---
# On copie le contenu du sous-dossier 'browser', là où se trouve l'application.
COPY --from=build /usr/src/app/dist/frontend/browser /usr/share/nginx/html/mspr-front

# La configuration est correcte, on l'écrase.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# On s'assure que les permissions sont bonnes.
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80