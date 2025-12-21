FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM caddy:2-alpine
COPY --from=builder /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
```

**`Caddyfile`:**
```
:80 {
    root * /srv
    encode gzip
    file_server
    try_files {path} /index.html
}
