# Deployment Guide - Westagentur

## 🐳 Docker & Coolify Deployment

### Wichtige Dateien
- `Dockerfile` - Multi-stage Build für Production
- `docker-compose.yml` - Lokales Testing
- `nginx.conf` - Nginx Konfiguration
- `.dockerignore` - Build-Optimierung

### Port-Konfiguration
- **Container Port**: `80`
- **Lokaler Test Port**: `3000` (docker-compose)
- **Health Check**: `/health` Endpoint

---

## 📦 Lokales Docker-Testing

### Build und Start
```bash
# Mit docker-compose
docker-compose up --build

# Oder direkt mit Docker
docker build -t westagentur .
docker run -p 3000:80 westagentur
```

### Testen
```bash
# App öffnen
http://localhost:3000

# Health Check
curl http://localhost:3000/health
```

---

## 🚀 Coolify Deployment

### 1. Repository Setup
- **Repository**: `https://github.com/Redamzi/Westagentur`
- **Branch**: `claude/identify-language-cvpEv`
- **Build Type**: Dockerfile

### 2. Coolify Konfiguration

#### Build Settings
```
Build Pack: Dockerfile
Dockerfile Location: ./Dockerfile
Docker Context: .
```

#### Port Konfiguration
```
Port: 80
Protocol: HTTP
```

#### Health Check
```
Path: /health
Interval: 30s
Timeout: 3s
Start Period: 5s
Retries: 3
```

#### Environment Variables (optional)
```
NODE_ENV=production
```

### 3. Deployment Steps

1. **Neues Projekt in Coolify erstellen**
   - "New Resource" → "Docker"
   - Repository URL eingeben
   - Branch `claude/identify-language-cvpEv` auswählen

2. **Build-Konfiguration**
   - Dockerfile wird automatisch erkannt
   - Kein zusätzlicher Build-Befehl nötig

3. **Port Mapping**
   - Container Port: `80`
   - Coolify weist automatisch eine Domain zu

4. **Deploy**
   - "Deploy" Button klicken
   - Coolify baut und startet automatisch

---

## 🔧 Technische Details

### Multi-Stage Build
```dockerfile
Stage 1: node:18-alpine (Build)
- npm ci Installation
- Vite Build
- Generiert dist/ Ordner

Stage 2: nginx:alpine (Production)
- Kopiert dist/ nach /usr/share/nginx/html
- Custom nginx.conf
- Health Check Integration
```

### Nginx Features
- **Gzip Compression** für bessere Performance
- **Security Headers** (X-Frame-Options, X-XSS-Protection, etc.)
- **Static Asset Caching** (1 Jahr)
- **SPA Routing** (alle Routes → index.html)
- **Health Check Endpoint**

### Build-Output
```
CSS Bundle: ~20 kB (gzip: 4.32 kB)
JS Bundle: ~256 kB (gzip: 77.10 kB)
Total: ~276 kB (gzip: ~81 kB)
```

---

## 🔍 Troubleshooting

### Build schlägt fehl
```bash
# Prüfe Node-Version
docker run --rm node:18-alpine node --version

# Teste Build lokal
npm run build
```

### Health Check Fehler
```bash
# Teste Health Endpoint
curl http://localhost:PORT/health

# Erwartete Antwort: "healthy"
```

### Nginx startet nicht
```bash
# Prüfe nginx.conf Syntax
docker run --rm -v $(pwd)/nginx.conf:/etc/nginx/conf.d/default.conf nginx:alpine nginx -t
```

---

## 📊 Performance

### Optimierungen
- ✅ System Fonts (keine externen Font-Downloads)
- ✅ Lokales Tailwind CSS (kein CDN)
- ✅ Gzip Compression aktiviert
- ✅ Asset Caching (1 Jahr)
- ✅ Minimierte Bundles

### Load Times
- **Initial Load**: ~81 kB (gzipped)
- **Time to Interactive**: < 2s (bei gutem Server)

---

## 🔐 Security

### Implementierte Headers
```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: no-referrer-when-downgrade
```

### Blocked Paths
- `.git` Directory ist blockiert
- Health Check ohne Access Logs

---

## 📝 Wichtige URLs

- **Repository**: https://github.com/Redamzi/Westagentur
- **Branch**: claude/identify-language-cvpEv
- **Docker Hub**: (optional später konfigurieren)

---

## 🎯 Next Steps nach Deployment

1. Custom Domain in Coolify konfigurieren
2. SSL/TLS Zertifikat aktivieren (Let's Encrypt)
3. Environment Variables für API-Keys setzen (falls benötigt)
4. Monitoring und Logs prüfen
5. Backup-Strategie einrichten
