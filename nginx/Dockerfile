FROM nginx:1.27-alpine

# 기본 default.conf 제거 (포트 80 default_server 충돌 방지)
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
