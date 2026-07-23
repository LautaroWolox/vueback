# --- FASE 1: La "Fábrica" (Build Stage) ---
# Usamos una imagen de Node para construir nuestro proyecto Vue.
# FROM node:20-alpine AS build
FROM quay-registry-quay-quay-registry.apps.ocp4-mh.cloudteco.com.ar/devops/nodejs-22:10.0 AS build

# Establecemos el directorio de trabajo dentro del contenedor.
WORKDIR /app

# Copiamos solo los archivos de dependencias para aprovechar el caché de Docker.
# Si estos archivos no cambian, Docker no volverá a ejecutar 'npm ci'.
COPY package.json package-lock.json ./

# Instalamos las dependencias de forma limpia y rápida.
RUN npm ci

# Copiamos el resto del código fuente de la aplicación.
COPY . .


# Ejecutamos el script de build de Vue (definido en tu package.json).
# Esto generará la carpeta 'dist' con los archivos estáticos.
RUN npm run build


# --- FASE 2: El "Producto Final" (Final Stage) ---
# Usamos una imagen de Nginx súper ligera y segura (no corre como root).
# FROM nginxinc/nginx-unprivileged:stable-alpine
# FROM quay-registry-quay-quay-registry.apps.ocp4-mh.cloudteco.com.ar/devops/nginxinc/nginx-unprivileged:latest
FROM quay-registry-quay-quay-registry.apps.ocp4-mh.cloudteco.com.ar/devops/nginx_1.26:latest

# Eliminamos la configuración por defecto de Nginx.
# RUN rm /etc/nginx/conf.d/default.conf


# Copiamos nuestra propia configuración de Nginx (la crearemos a continuación)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos estáticos generados en la fase 1 a la carpeta que Nginx sirve.
# COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /opt/app-root/src/UI
COPY --from=build /app/dist /opt/app-root/src/UI

# Exponemos el puerto 8080, que es el que Nginx no privilegiado usa por defecto.
EXPOSE 8080

# El comando para iniciar Nginx en primer plano.
# La sintaxis correcta es un array de strings.
CMD ["nginx", "-g", "daemon off;"]