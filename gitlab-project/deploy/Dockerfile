# Container image that serves the built site with nginx (non-root, port 8080).
# Build from the project root:  docker build -f deploy/Dockerfile -t employee-directory .
# The site must be built first (npm run build) so dist/ exists; the CI pipeline does this.
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:1.27-alpine
FROM ${NGINX_IMAGE}
ARG BASE_PATH=/employee-directory/
ENV BASE_PATH=${BASE_PATH}
# nginx's entrypoint fills ${BASE_PATH} into the template at start-up.
COPY deploy/nginx.conf /etc/nginx/templates/default.conf.template
ENV NGINX_ENVSUBST_FILTER=BASE_PATH
COPY dist/ /usr/share/nginx/html${BASE_PATH}
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
