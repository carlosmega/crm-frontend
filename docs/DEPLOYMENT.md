# Deployment Guide

> **Guía completa para deployment y producción**

---

## VARIABLES DE ENTORNO

### Desarrollo (.env.local)

Crear archivo `.env.local` en la raíz del proyecto (nunca commitear):

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="CRM Sales Dynamics"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCK_DATA=true  # true en desarrollo

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true
```

### Producción

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="CRM Sales Dynamics"
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Backend API
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_USE_MOCK_DATA=false  # IMPORTANTE: false en producción

# NextAuth
NEXTAUTH_SECRET=<generated-secure-key-min-32-chars>
NEXTAUTH_URL=https://your-domain.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true

# OAuth Providers (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

---

## BUILD DE PRODUCCIÓN

### Pre-requisitos

- Node.js 18.x o superior
- npm 8.x o superior

### Proceso de Build

```bash
# 1. Install dependencies (production only)
npm ci

# 2. Run linter
npm run lint

# 3. Build optimized bundle
npm run build

# 4. Start production server (local test)
npm start
```

### Verificación de Build

El comando `npm run build` debe:
- ✅ Completar sin errores
- ✅ Mostrar bundle size < 180KB por página
- ✅ No mostrar warnings críticos

**Output esperado**:
```
Route (app)                                Size     First Load JS
┌ ○ /                                      142 B          87.2 kB
├ ○ /leads                                 1.45 kB        88.3 kB
├ ○ /opportunities                         1.52 kB        89.1 kB
└ ○ /quotes                                1.48 kB        88.9 kB
...
```

---

## DEPLOYMENT EN VERCEL (RECOMENDADO)

### Setup Inicial

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login a Vercel**:
```bash
vercel login
```

3. **Deploy inicial**:
```bash
vercel
```

4. **Deploy a producción**:
```bash
vercel --prod
```

### Configuración en Dashboard

**Project Settings** → **Build & Development Settings**:
- Framework Preset: `Next.js`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm ci`
- Node Version: `18.x` o superior

**Environment Variables**:
1. Ir a **Settings** → **Environment Variables**
2. Agregar todas las variables de producción (ver sección anterior)
3. Seleccionar scope: `Production`, `Preview`, o ambos

### Dominios Personalizados

1. **Settings** → **Domains**
2. Agregar dominio: `your-domain.com`
3. Configurar DNS según instrucciones de Vercel

---

## DEPLOYMENT EN NETLIFY

### Setup Inicial

1. **Conectar repositorio**:
   - Ir a Netlify dashboard
   - "New site from Git"
   - Seleccionar repositorio

2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18.x`

### Configuración

**netlify.toml** (en raíz del proyecto):
```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Environment Variables**:
1. **Site settings** → **Environment variables**
2. Agregar todas las variables de producción

---

## DEPLOYMENT EN VPS (MANUAL)

### Usando PM2

```bash
# 1. Instalar PM2 globalmente
npm install -g pm2

# 2. Build del proyecto
npm ci
npm run build

# 3. Iniciar con PM2
pm2 start npm --name "crm-app" -- start

# 4. Configurar auto-restart
pm2 startup
pm2 save
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL con Let's Encrypt

```bash
# 1. Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# 2. Obtener certificado
sudo certbot --nginx -d your-domain.com

# 3. Auto-renovación
sudo certbot renew --dry-run
```

---

## CHECKLIST PRE-DEPLOY

### Código

- [ ] `npm run build` completa sin errores
- [ ] No hay console.logs en producción
- [ ] No hay TODOs críticos en código
- [ ] Todos los tests pasan
- [ ] No hay warnings de seguridad en dependencias

### Configuración

- [ ] Variables de entorno configuradas
- [ ] `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] `NEXTAUTH_SECRET` es seguro (min 32 chars)
- [ ] URLs apuntan a producción

### Performance

- [ ] Bundle size < 180KB por página
- [ ] Images optimizadas (usando next/image)
- [ ] Lazy loading implementado en modals/dialogs
- [ ] Error boundaries en todas las rutas
- [ ] loading.tsx en todas las rutas

### Seguridad

- [ ] CSP headers configurados
- [ ] CORS configurado correctamente
- [ ] Rate limiting habilitado
- [ ] Secrets no expuestos en cliente

---

## MONITOREO POST-DEPLOY

### Métricas Clave

**Performance**:
- First Contentful Paint (FCP) < 800ms
- Time to Interactive (TTI) < 1.5s
- Navegación percibida < 600ms

**Errores**:
- Sin errores en console de navegador
- API responses < 2s
- Error rate < 1%

**Recursos**:
- Memory usage estable
- CPU usage < 70%
- Disk usage monitoreado

### Herramientas

**Vercel Analytics** (si usas Vercel):
- Métricas Web Vitals automáticas
- Real User Monitoring (RUM)

**Sentry** (recomendado):
```bash
npm install @sentry/nextjs
```

**Google Analytics**:
```tsx
// app/layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

---

## TROUBLESHOOTING

### Build Failures

**Error**: "Module not found"
```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Error**: "Out of memory"
```bash
# Aumentar heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Runtime Errors

**Error**: "Hydration mismatch"
- Verificar que Server Components no usen browser APIs
- Revisar que fechas/timestamps sean consistentes

**Error**: "API timeout"
- Aumentar timeout en vercel.json:
```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

---

## RECURSOS

### Documentación

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

### Seguridad

- **CVE-2025-55182** (React): https://react.dev/blog/2025/12/03/critical-security-vulnerability
- **CVE-2025-66478** (Next.js): https://nextjs.org/blog/CVE-2025-66478
- Mantener actualizado: `npm update next react react-dom`
