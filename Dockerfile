# Usa Nginx sobre una versión ligera de Linux (Alpine)
FROM nginx:alpine

# Limpia cualquier archivo residual del servidor por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copia TODO el contenido de tu carpeta local al contenedor
COPY . /usr/share/nginx/html

# Indica que el contenedor escuchará en el puerto 80
EXPOSE 80

# Comando para arrancar el servidor (opcional, Nginx lo hace por defecto)
CMD ["nginx", "-g", "daemon off;"]