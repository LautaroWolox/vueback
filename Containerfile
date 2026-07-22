# --- FASE 1: Build del frontend Vue/Vite ---
FROM quay-registry-quay-quay-registry.apps.ocp4-mh.cloudteco.com.ar/devops/nodejs-22:10.0 AS build

WORKDIR /app

# Dependencias
COPY package.json package-lock.json ./
RUN npm ci

# Código fuente
COPY . .

# Variables de Vite recibidas desde la pipeline.
# Deben existir antes de ejecutar npm run build.
ARG VITE_FM_MV_URL
ARG VITE_ORIGIN
ARG VITE_ALLOWED_HOSTS
ARG VITE_PARAMETER1

ENV VITE_FM_MV_URL=${VITE_FM_MV_URL} \
    VITE_ORIGIN=${VITE_ORIGIN} \
    VITE_ALLOWED_HOSTS=${VITE_ALLOWED_HOSTS} \
    VITE_PARAMETER1=${VITE_PARAMETER1}

# Validación básica para evitar generar una imagen sin configuración.
RUN test -n "$VITE_FM_MV_URL" \
 && test -n "$VITE_ORIGIN" \
 && test -n "$VITE_ALLOWED_HOSTS" \
 && test -n "$VITE_PARAMETER1"

RUN npm run build

# --- FASE 2: Nginx ---
FROM quay-registry-quay-quay-registry.apps.ocp4-mh.cloudteco.com.ar/devops/nginx_1.26:latest

RUN mkdir -p /opt/app-root/src/UI
COPY --from=build /app/dist/ /opt/app-root/src/UI/

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]