# Dockerfile pour le Frontend AGHeal (React/Vite)
# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances (npm ou bun/yarn selon le projet)
COPY package*.json ./
RUN npm ci

# Copier tout le code
COPY . .

# Variables d'environnement pour le build
# VITE_API_URL doit pointer vers l'URL publique de l'API en prod
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ========== STAGE 2: Production ==========
FROM nginx:alpine

# Copier la configuration NGINX personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers compilés du stage builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
