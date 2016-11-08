FROM nginx:1.10

MAINTAINER Simon Fan <simon.fan@habem.us>

# nginx configuration files
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# files to be served
COPY ./dist/browser-cloud /data/www
