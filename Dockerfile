# Production environment
FROM nginx:stable-alpine

RUN rm -f /etc/nginx/conf.d/default.conf
COPY gzip.conf /etc/nginx/conf.d/gzip.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY dist /usr/share/nginx/html
RUN mv /usr/share/nginx/html/soko-fe/** /usr/share/nginx/html/

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
