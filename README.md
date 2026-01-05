# CRM Sales Dynamics

> Sistema CRM moderno para gestión del ciclo completo de ventas basado en **Microsoft Dynamics 365 Sales** y **Common Data Service (CDS)**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## 🎯 Descripción

Sistema CRM empresarial que implementa el proceso completo de ventas Quote-to-Cash, desde la captación de leads hasta la facturación. Construido con arquitectura limpia, componentes reutilizables y optimizado para rendimiento.

### Flujo de Ventas

```
Lead → Opportunity → Quote → Order → Invoice
```

**Gestión completa del ciclo:**
- 📊 **Lead Management**: Calificación y conversión de prospectos
- 💼 **Opportunity Pipeline**: Seguimiento de oportunidades por etapas de venta
- 📄 **Quote Management**: Cotizaciones con múltiples productos y descuentos
- 📦 **Order Processing**: Gestión de pedidos y cumplimiento
- 💰 **Invoice Management**: Facturación y seguimiento de pagos

## ✨ Características Principales

### Módulos de Negocio

- **Leads**: Gestión de prospectos con calificación B2B/B2C
- **Opportunities**: Pipeline de ventas con 4 etapas (Qualify → Develop → Propose → Close)
- **Quotes**: Cotizaciones con plantillas, productos y análisis
- **Orders**: Procesamiento de pedidos con seguimiento de estados
- **Invoices**: Facturación con aging report y PDF export
- **Accounts**: Gestión de empresas/organizaciones (B2B)
- **Contacts**: Gestión de personas y tomadores de decisiones
- **Products**: Catálogo de productos y servicios
- **Activities**: Registro de interacciones (emails, llamadas, tareas, reuniones)

### Características Técnicas

- ✅ **Server-First Architecture**: Server Components por defecto, Client Components solo cuando necesario
- ✅ **Clean Architecture**: Separación clara en capas (app → features → shared → core)
- ✅ **Type Safety**: TypeScript estricto con contratos CDS completos
- ✅ **Optimized Performance**: FCP < 400ms, TTI < 800ms
- ✅ **Responsive Design**: Optimizado para desktop, tablet y móvil
- ✅ **Real-time Updates**: TanStack Query con cache inteligente
- ✅ **PDF Export**: Generación de quotes, orders e invoices
- ✅ **Drag & Drop**: Kanban boards para oportunidades
- ✅ **Advanced Filtering**: DataTables con búsqueda, filtros y paginación

## 🛠️ Stack Tecnológico

### Core
- **Next.js 15.5.9** - React framework con App Router
- **React 19.2.3** - Server + Client Components
- **TypeScript 5** - Type safety
- **Tailwind CSS v4** - Utility-first CSS

### UI Components
- **shadcn/ui** - 43+ componentes integrados
- **lucide-react** - Iconos
- **framer-motion** - Animaciones
- **recharts** - Gráficos y analytics

### Data & State
- **TanStack Query v5** - Server state management
- **react-hook-form** - Formularios performantes
- **zod** - Validación de esquemas
- **axios** - HTTP client

### Backend Integration
- **Django REST Framework** - API backend
- **NextAuth v5** - Autenticación

### Development
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

## 🚀 Instalación

### Requisitos Previos

- Node.js 18.x o superior
- npm o yarn
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd CRM_Claude_Next
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local` en la raíz:

```env
# App Configuration
NEXT_PUBLIC_APP_NAME="CRM Sales Dynamics"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_USE_MOCK_DATA=true

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm start            # Servidor de producción
npm run lint         # Ejecutar ESLint
npm run test         # Ejecutar tests
```

## 📁 Estructura del Proyecto

```
CRM_Claude_Next/
├── src/
│   ├── app/                 # Rutas Next.js (App Router)
│   │   ├── (sales)/        # Grupo de rutas de ventas
│   │   │   ├── leads/
│   │   │   ├── opportunities/
│   │   │   ├── quotes/
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   ├── accounts/
│   │   │   ├── contacts/
│   │   │   ├── products/
│   │   │   └── activities/
│   │   └── dashboard/
│   ├── features/            # Lógica de negocio por dominio
│   │   ├── leads/
│   │   ├── opportunities/
│   │   ├── quotes/
│   │   └── ...
│   ├── shared/              # Componentes y hooks compartidos
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── core/                # Infraestructura y contratos
│       ├── contracts/       # Entidades y enums CDS
│       ├── api/            # API client
│       └── config/         # Configuración
├── docs/                    # Documentación técnica
├── public/                  # Assets estáticos
└── CLAUDE.md               # Instrucciones del proyecto
```

## 🏗️ Arquitectura

### Clean Architecture (Capas)

```
app/ → features/ → shared/ → core/
```

- **app/**: Presentation layer (rutas Next.js, layouts)
- **features/**: Feature layer (lógica de negocio por dominio)
- **shared/**: Shared layer (componentes UI reutilizables)
- **core/**: Core layer (infraestructura, contratos CDS)

### Principios Arquitectónicos

1. **The Scope Rule**: El alcance determina la estructura
   - Código usado por 2+ features → `/shared`
   - Código usado por 1 feature → Permanece local

2. **Screaming Architecture**: La estructura cuenta la historia del negocio
   - Nombres de features describen funcionalidad, no implementación

3. **Server-First Mindset**: Server Components por defecto
   - Solo usar `'use client'` cuando sea necesario

## 🔒 Modelo de Datos CDS

El proyecto implementa el modelo de datos de **Microsoft Dynamics 365 Sales**:

### Entidades Principales

- **Lead**: Cliente potencial (Open → Qualified → Disqualified)
- **Opportunity**: Oportunidad de venta con sales stages
- **Quote**: Cotización formal con productos
- **Order**: Pedido confirmado
- **Invoice**: Factura con seguimiento de pagos
- **Account**: Empresa/Organización (B2B)
- **Contact**: Persona/Contacto
- **Product**: Catálogo de productos
- **Activity**: Interacciones (Email, Phone, Task, Meeting)

### Proceso Quote-to-Cash

```
1. Lead Qualification
   ↓
2. Opportunity Creation (Sales Stages: 25% → 50% → 75% → 100%)
   ↓
3. Quote Generation
   ↓
4. Opportunity Won → Order Creation
   ↓
5. Order Fulfillment
   ↓
6. Invoice Generation → Payment
```

## 📊 Performance

### Targets

| Métrica | Target | Crítico |
|---------|--------|---------|
| First Contentful Paint | < 400ms | < 800ms |
| Time to Interactive | < 800ms | < 1.5s |
| Navigation | < 300ms | < 600ms |
| Bundle Size/página | < 120KB | < 180KB |

### Optimizaciones Implementadas

- Server Components para renderizado óptimo
- Lazy loading de modals y dialogs
- Memoización de componentes de lista
- Virtual scrolling para listas grandes
- Image optimization con next/image
- Dynamic imports para code splitting

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

Ver `docs/COMO_PROBAR.md` para guías detalladas de testing.

## 📖 Documentación

La documentación técnica completa está disponible en la carpeta `/docs`:

- **CLAUDE.md** (raíz): Instrucciones arquitectónicas y guía de desarrollo
- **docs/ROADMAP.md**: Hoja de ruta y planificación
- **docs/IMPLEMENTATION_GUIDE.md**: Guía de implementación
- **docs/DATA_MODEL.md**: Modelo de datos CDS completo
- **docs/SECURITY_CONFIG_GUIDE.md**: Configuración de seguridad
- **docs/BPF_QUICK_REFERENCE.md**: Referencia de Business Process Flows

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código

- Seguir las reglas de ESLint configuradas
- Usar TypeScript estricto
- Seguir la Clean Architecture definida
- Escribir tests para nuevas features
- Documentar funcionalidad compleja

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado con arquitectura limpia y mejores prácticas de Next.js 15.

---

**Nota**: Este proyecto implementa el modelo de datos de Microsoft Dynamics 365 Sales / Common Data Service (CDS) pero NO requiere licencia de Microsoft Dynamics. Es una implementación independiente del modelo de datos.
