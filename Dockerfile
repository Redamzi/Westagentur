# Build Stage (Frontend + Prerendering)
FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# API dependencies
FROM node:22-alpine AS api
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev

# Production Stage: nginx (static site) + Node API in one container
FROM nginx:alpine

RUN apk add --no-cache libstdc++ libgcc
COPY --from=node:22-alpine /usr/local/bin/node /usr/local/bin/node

COPY --from=api /app/server/node_modules /app/server/node_modules
COPY server/package.json server/index.js /app/server/
COPY server/src /app/server/src
COPY docker/40-start-api.sh /docker-entrypoint.d/40-start-api.sh
RUN chmod +x /docker-entrypoint.d/40-start-api.sh

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENV DATA_DIR=/data \
    API_HOST=127.0.0.1 \
    API_PORT=8787
VOLUME /data

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
