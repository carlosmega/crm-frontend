# CLAUDE.md - CRM Sales Application

> **Contexto**: Sistema CRM para gestión del ciclo completo de ventas basado en **Microsoft Dynamics 365 Sales** y **Common Data Service (CDS)**. Gestiona el proceso completo: **Lead → Opportunity → Quote → Order → Invoice** con arquitectura limpia y escalable.

---

## 🎯 PRINCIPIOS ARQUITECTÓNICOS FUNDAMENTALES

### 1. LA REGLA DEL ALCANCE (The Scope Rule)

**"El alcance determina la estructura"**

- ✅ Código usado por **2+ features** → `/shared` o directorios globales
- ✅ Código usado por **1 feature** → Permanece **local** en ese feature
- ❌ Nunca mover código a `/shared` "por si acaso" se reutiliza en el futuro
- ❌ Violar esta regla genera acoplamiento innecesario y deuda técnica

**Ejemplo**:
```typescript
// ✅ CORRECTO: Hook usado solo en leads
// src/features/leads/hooks/use-lead-qualification.ts

// ✅ CORRECTO: Hook usado en leads, opportunities y accounts
// src/shared/hooks/use-pagination.ts

// ❌ INCORRECTO: Hook de leads en /shared
// src/shared/hooks/use-lead-qualification.ts
```

---

### 2. SCREAMING ARCHITECTURE

**"La estructura debe gritar qué hace la aplicación"**

- Los nombres de **features** describen **funcionalidad de negocio**, no implementación técnica
- La estructura de directorios cuenta la **historia del negocio** al primer vistazo

```
✅ features/lead-qualification/     (negocio)
✅ features/opportunity-pipeline/   (negocio)
❌ features/forms/                  (técnico)
❌ features/data-grid/              (técnico)
```

---

### 3. SERVER-FIRST MINDSET

**"Los componentes son Server Components por defecto"**

- ✅ Preferir **Server Components** (sin `'use client'`)
- ✅ Server Components → `fetch` nativo (aprovecha caching de Next.js)
- ✅ Client Components → `axios` (interceptores, manejo de errores)
- ✅ Server Actions (`'use server'`) para mutaciones desde formularios
- ❌ No usar `'use client'` innecesariamente

---

## 🏗️ CLEAN ARCHITECTURE - CAPAS Y RESPONSABILIDADES

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (app/)                                  │
│  - Rutas de Next.js (App Router)                            │
│  - Server Components (default)                              │
│  - Client Components ('use client')                         │
└─────────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────────┐
│  FEATURE LAYER (features/)                                  │
│  - Lógica de negocio por dominio CDS                        │
│  - Componentes específicos de feature                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────────┐
│  SHARED LAYER (shared/)                                     │
│  - Componentes UI reutilizables (shadcn/ui)                 │
│  - Hooks compartidos (2+ features)                          │
└─────────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────────┐
│  CORE LAYER (core/)                                         │
│  - Contratos CDS (Single Source of Truth)                   │
│  - API Client, Config, Providers                            │
└─────────────────────────────────────────────────────────────┘
```

**Reglas de dependencia**:
- `app/` puede importar de `features/`, `shared/`, `core/`
- `features/` puede importar de `shared/`, `core/` (NO de otros features)
- `shared/` puede importar de `core/` solamente
- `core/` no importa de ninguna otra capa (independiente)

---

## 📁 ESTRUCTURA DE PROYECTO OBLIGATORIA

```
app/              → Presentation (Rutas Next.js, layouts, loading, error)
features/         → Feature Logic (Por dominio CDS: leads, opportunities, quotes, etc.)
shared/           → Shared Resources (UI components, hooks 2+, utils)
core/             → Infrastructure (Contracts CDS, API client, config, auth, providers)
```

**Dominios implementados**: leads, opportunities, quotes, orders, invoices, accounts, contacts, products, activities, analytics, settings, auth

---

## 📊 MODELO DE DATOS CDS

Este CRM implementa el modelo completo de **Microsoft Dynamics 365 Sales** basado en CDS.

### Flujo Quote-to-Cash

```
Lead (Open) → [Qualify] → Opportunity (Open)
                             ↓
                          Quote (Draft → Active)
                             ↓
                          Order (Active → Fulfilled)
                             ↓
                          Invoice (Active → Paid)
```

### Entidades Principales

**Core Entities**: Lead, Opportunity, Account, Contact, Quote, Order, Invoice, Product, Activity

**Reglas de Negocio Críticas**:
- Lead calificado genera: [Account opcional] + Contact + Opportunity
- Opportunity.customerid es polimórfico: Account (B2B) o Contact (B2C)
- Sales Stages: Qualify(25%) → Develop(50%) → Propose(75%) → Close(100%)
- Quote-to-Cash: Quote Won → Order → Invoice

**📖 Referencia completa**: Ver [docs/CDS_MODEL.md](docs/CDS_MODEL.md)

---

## 📑 TAB STANDARDIZATION

**Convenciones unificadas** en todas las vistas de detalle y formularios:

| Patrón | Correcto ✅ | Incorrecto ❌ |
|--------|-------------|---------------|
| **Primera pestaña** | "General" | "Summary", "Basic Info" |
| **Última pestaña (detalle)** | "Activities" | "History", "Timeline" |
| **IDs de pestañas** | `general`, `activities` | `summary`, `basicInfo` |

**Patrón de Implementación**:
- Portal rendering con `createPortal` en sticky header
- Section filtering en formularios con 2+ pestañas
- NO Card wrappers en páginas (`*FormTabs` y `*DetailTabs` van directos)

**📖 Guía completa**: Ver [docs/TAB_STANDARDIZATION.md](docs/TAB_STANDARDIZATION.md)

---

## 📦 STACK TECNOLÓGICO

- **Next.js 15.5.9** - React framework con App Router
- **React 19.2.3** - Server + Client Components
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **shadcn/ui** - 43 componentes UI integrados
- **TanStack Query v5** - State management y cache
- **axios 1.7.9** / **fetch nativo** - HTTP clients
- **NextAuth v5 beta** - Autenticación
- **Django REST Framework** - Backend API

---

## ⚡ OPTIMIZACIÓN DE RENDIMIENTO

**Meta**: Navegación < 300ms percibido

### Reglas Críticas

1. **Server Components por defecto** - Solo `"use client"` si necesita hooks/events
2. **loading.tsx obligatorio** - Toda ruta debe tener Skeleton UI
3. **React.memo para listas** - DataTable, Card grids DEBEN memoizarse
4. **useMemo/useCallback** - Para computaciones y handlers
5. **Dynamic imports** - Componentes modals con `next/dynamic`

### Targets

| Métrica | Target | Crítico |
|---------|--------|---------|
| FCP | < 400ms | < 800ms |
| TTI | < 800ms | < 1.5s |
| Navigation | < 300ms | < 600ms |
| Bundle/página | < 120KB | < 180KB |

---

## 🛠️ COMANDOS DE DESARROLLO

```bash
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # ESLint
```

**shadcn/ui**:
```bash
npx shadcn@latest add [component-name]
```

---

## ✅ CHECKLIST DE CALIDAD

Antes de aprobar cualquier código:

1. **Verificación de alcance**: ¿Conté correctamente el uso entre features? ¿Debería estar en `/shared`?
2. **Screaming architecture**: ¿Un dev nuevo entiende qué hace la app viendo carpetas?
3. **Server/Client correctos**: ¿Server Components sin `'use client'`?
4. **Contratos CDS**: ¿Estoy usando tipos de `core/contracts` en vez de crear nuevos?
5. **Enums CDS**: ¿Uso enums correctos en vez de strings mágicos?
6. **Feature isolation**: ¿Este feature NO importa de otros features?
7. **Flujo de conversión correcto**: ¿Lead calificado genera entidades correctas según B2B/B2C?
8. **Customer polimórfico**: ¿Opportunity.customerid apunta correctamente a Account o Contact?
9. **Quote-to-Cash flow**: ¿Se respeta el flujo Quote → Order → Invoice?
10. **Performance optimizada**: ¿Pasé el checklist de performance?
11. **NO Card wrappers**: ¿`*FormTabs`/`*DetailTabs` van directos sin Card wrapper en páginas?
12. **Tab naming**: ¿Primera pestaña es "General" y última es "Activities"?

---

## 🎯 FILOSOFÍA

> Soy el guardián de una arquitectura limpia y escalable basada en el modelo CDS de Microsoft Dynamics 365 Sales. Cada decisión resulta en código inmediatamente comprensible, correctamente delimitado según el ciclo completo de ventas (Lead → Opportunity → Quote → Order → Invoice), y construido para mantenibilidad a largo plazo.

**Principio clave**: Si un desarrollador ve `features/lead-qualification/`, debe entender inmediatamente que gestiona la calificación de leads. Si ve `core/contracts/entities/lead.ts`, debe saber que ahí está la definición canónica del Lead según CDS.

**Principio de conversión**: La calificación de un Lead es flexible - puede generar Account nuevo, vincular Account existente, o no crear Account (B2C). El sistema debe soportar los 3 escenarios.

**Principio Quote-to-Cash**: El ciclo de ventas no termina en Opportunity Won. El proceso completo incluye Quote → Order → Invoice con sus respectivas validaciones.

---

## 📚 DOCUMENTACIÓN EXTENDIDA

La documentación completa del proyecto está organizada en archivos separados:

- **[docs/CDS_MODEL.md](docs/CDS_MODEL.md)** - Modelo de datos CDS completo
  - Entidades principales (Lead, Opportunity, Account, Contact, Quote, Order, Invoice, Product, Activity)
  - Enumeraciones CDS
  - Flujos de trabajo (Lead qualification, Opportunity pipeline, Quote-to-Cash)

- **[docs/TAB_STANDARDIZATION.md](docs/TAB_STANDARDIZATION.md)** - Estándares de UI
  - Estructura de pestañas por entidad
  - Patrones de implementación (Portal rendering, Section filtering, Sub-grids)
  - Styling consistency
  - Checklist para nuevas entidades

- **[docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md)** - Estado del proyecto
  - Features implementadas (13 dominios)
  - Infraestructura core
  - Componentes compartidos
  - Estadísticas del proyecto
  - Áreas pendientes

- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** - Guía de deployment
  - Variables de entorno
  - Build de producción
  - Deployment en Vercel/Netlify/VPS
  - Checklist pre-deploy
  - Monitoreo post-deploy

- **[docs/MAINTENANCE.md](docs/MAINTENANCE.md)** - Mantenimiento
  - Política de duplicados
  - Limpieza regular
  - Actualización de dependencias
  - Code quality
  - Scripts útiles

---

## 🔗 RECURSOS Y REFERENCIAS

### Documentación Técnica

- **Next.js 15**: https://nextjs.org/docs
- **React 19**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com/
- **TanStack Query**: https://tanstack.com/query/latest

### Microsoft Dynamics 365 Sales

- **CDS Data Model**: https://docs.microsoft.com/en-us/power-apps/developer/data-platform/
- **Entity Reference**: https://docs.microsoft.com/en-us/dynamics365/sales/developer/entities/
- **Sales Process**: https://docs.microsoft.com/en-us/dynamics365/sales/nurture-sales-from-lead-order-sales

### Seguridad

- **CVE-2025-55182** (React): https://react.dev/blog/2025/12/03/critical-security-vulnerability
- **CVE-2025-66478** (Next.js): https://nextjs.org/blog/CVE-2025-66478
- Mantener actualizado: `npm update next react react-dom`

---

**Última actualización**: 2025-01-03 (Optimizado CLAUDE.md: 25.3k chars, -37% vs original)
