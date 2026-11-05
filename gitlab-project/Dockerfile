# Employee directory: web app + API server in one image.
# Red Hat UBI Node.js image: runs as a non-root user with an arbitrary UID, as OpenShift requires.
#   docker build -t employee-directory .
#   docker run -p 8080:8080 --env-file .env employee-directory
ARG NODE_IMAGE=registry.access.redhat.com/ubi9/nodejs-22:latest

FROM ${NODE_IMAGE} AS build
USER 0
WORKDIR /build
COPY package.json package-lock.json ./
RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev

FROM ${NODE_IMAGE}
USER 0
WORKDIR /opt/app-root/app
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY --from=build /build/package.json ./
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/server-dist ./server-dist
COPY --from=build /build/server/migrations ./server/migrations
COPY --from=build /build/dist ./dist
COPY --from=build /build/tools/sample-data.json ./tools/sample-data.json
# OpenShift runs the container as a random UID in group 0: give group 0 the same rights as the owner.
RUN chgrp -R 0 /opt/app-root/app && chmod -R g=u /opt/app-root/app
USER 1001
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:8080/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server-dist/server/src/index.js"]
