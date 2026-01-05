# Tab Standardization - Estructura Unificada

> **Convenciones y patrones para vistas de detalle y formularios**

---

## CONVENCIONES DE NOMENCLATURA UNIVERSAL

**REGLA CRÍTICA**: Nombres consistentes en todas las vistas de detalle y formularios

| Patrón | Correcto ✅ | Incorrecto ❌ |
|--------|-------------|---------------|
| **Primera pestaña** | "General" | "Summary", "Basic Info", "Overview" |
| **Última pestaña (detalle)** | "Activities" | "History", "Timeline" |
| **Registros relacionados** | "Related {Entity}" | "Related Records" |
| **IDs de pestañas** | `general`, `activities` | `summary`, `basicInfo` |

---

## ESTRUCTURA DE PESTAÑAS POR ENTIDAD

### 1. Contacts (Entidad de Registro)

**Vista Detalle**: 4 pestañas
- ✅ **General**: Información básica y contacto
- ✅ **Professional**: Información profesional (cargo, empresa)
- ✅ **Address**: Dirección completa
- ✅ **Activities**: Timeline de actividades

**Vista Formulario**: 3 pestañas (sin Activities)
- ✅ **General**: Nombre, teléfono, email
- ✅ **Professional**: Cargo, empresa
- ✅ **Address**: Dirección

**Archivos**:
- `src/features/contacts/components/contact-detail-tabs.tsx`
- `src/features/contacts/components/contact-form-tabs.tsx`
- `src/features/contacts/components/contact-form.tsx` (con section filtering)

---

### 2. Leads (Entidad BPF)

**Vista Detalle**: 6 pestañas (BPF + Activities)
- ✅ **General**: Información básica del lead
- ✅ **Qualify**: Métricas de calificación
- ✅ **Develop**: Desarrollo de oportunidad
- ✅ **Propose**: Propuesta comercial
- ✅ **Close**: Cierre (deshabilitado hasta conversión)
- ✅ **Activities**: Timeline de actividades

**Vista Formulario**: 5 pestañas (BPF sin Activities)
- ✅ **General**: Nombre, empresa, contacto
- ✅ **Qualify**: Budget, timeframe
- ✅ **Develop**: Necesidades
- ✅ **Propose**: Propuesta
- ✅ **Close**: Cierre (deshabilitado)

**Archivos**:
- `src/features/leads/components/lead-detail-tabs.tsx`
- `src/features/leads/components/lead-form-tabs.tsx`

---

### 3. Opportunities (Entidad BPF)

**Vista Detalle**: 6 pestañas (BPF + Activities)
- ✅ **General**: Información básica
- ✅ **Qualify**: Budget, necesidades (25%)
- ✅ **Develop**: Solución, competidores (50%)
- ✅ **Propose**: Presentación, contactos (75%)
- ✅ **Close**: Valores finales, estado (100%)
- ✅ **Activities**: Timeline de actividades

**Vista Formulario**: 5 pestañas (BPF sin Activities)
- ✅ **General**: Nombre, customer, valor estimado
- ✅ **Qualify**: Budget amount, status, timeframe
- ✅ **Develop**: Proposed solution, competitors
- ✅ **Propose**: Presentation date, contacts
- ✅ **Close**: Actual value, close date

**Archivos**:
- `src/features/opportunities/components/opportunity-detail-tabs.tsx`
- `src/features/opportunities/components/opportunity-form.tsx` (ya con tabs BPF)

---

### 4. Quotes (Entidad Transaccional)

**Vista Detalle**: 6 pestañas
- ✅ **General**: Información básica (renombrado desde "Summary")
- ✅ **Products**: Líneas de cotización
- ✅ **Details**: Detalles adicionales
- ✅ **Versions**: Versiones de cotización
- ✅ **Related**: Registros relacionados
- ✅ **Activities**: Timeline actualizado

**Vista Formulario**: 2 pestañas
- ✅ **General**: Nombre, descripción, customer
- ✅ **Validity**: Fechas de vigencia (effectivefrom/to)

**Archivos**:
- `src/features/quotes/components/quote-detail-tabs.tsx`
- `src/features/quotes/components/quote-form-tabs.tsx`
- `src/features/quotes/components/quote-form.tsx` (con section filtering)

---

### 5. Orders (Entidad Transaccional)

**Vista Detalle**: 5 pestañas
- ✅ **General**: Información básica (renombrado desde "Summary")
- ✅ **Products**: Líneas de pedido
- ✅ **Shipping**: Información de envío
- ✅ **Related**: Registros relacionados
- ✅ **Activities**: Timeline actualizado

**Vista Formulario**: No editable (solo lectura)

**Archivos**:
- `src/features/orders/components/order-detail-tabs.tsx`

---

### 6. Invoices (Entidad Transaccional)

**Vista Detalle**: 5 pestañas
- ✅ **General**: Información básica (renombrado desde "Summary")
- ✅ **Items**: Líneas de factura
- ✅ **Details**: Dirección de facturación, pago
- ✅ **Related**: Registros relacionados
- ✅ **Activities**: Timeline actualizado

**Vista Formulario**: 2 pestañas (inline en edit page)
- ✅ **General**: Descripción, fecha de vencimiento (renombrado desde "Basic Info")
- ✅ **Details**: Dirección de facturación (renombrado desde "Billing Address")

**Archivos**:
- `src/features/invoices/components/invoice-detail-tabs.tsx`
- `src/app/(sales)/invoices/[id]/edit/page.tsx` (formulario inline)

---

### 7. Accounts (Entidad de Registro con Sub-grids)

**Vista Detalle**: 4 pestañas
- ✅ **General**: Información de contacto, negocio, dirección (renombrado desde "Summary")
- ✅ **Related Contacts**: Sub-grid de contactos asociados (HABILITADO)
- ✅ **Related Opportunities**: Sub-grid de oportunidades (HABILITADO)
- ✅ **Activities**: Timeline de actividades

**Vista Formulario**: 2 pestañas
- ✅ **General**: Nombre, contacto, negocio (renombrado desde "General Information")
- ✅ **Address**: Dirección completa

**Sub-grids**:
- `src/features/accounts/components/account-contacts-subgrid.tsx`
- `src/features/accounts/components/account-opportunities-subgrid.tsx`

**Archivos**:
- `src/features/accounts/components/account-detail-tabs.tsx` (sub-grids habilitados)
- `src/features/accounts/components/account-form-tabs.tsx`

---

### 8. Products (Entidad de Registro)

**Vista Detalle**: 3 pestañas
- ✅ **General**: Información básica, pricing (renombrado desde "Summary")
- ✅ **Related**: Registros relacionados (HABILITADO)
- ✅ **Activities**: Timeline actualizado

**Vista Formulario**: 2 pestañas
- ✅ **General**: Información básica + Pricing
- ✅ **Inventory**: Gestión de inventario

**Archivos**:
- `src/features/products/components/product-detail-tabs.tsx`
- `src/features/products/components/product-form-tabs.tsx`
- `src/features/products/components/product-form.tsx` (con section filtering)

---

## PATRONES DE IMPLEMENTACIÓN

### 0. Page Structure Pattern - NO Card Wrappers

**REGLA CRÍTICA**: Los componentes `*FormTabs` y `*DetailTabs` NUNCA deben envolverse en Card/CardContent en las páginas

**❌ INCORRECTO - Página con Card wrapper extra:**
```tsx
// ❌ NO HACER ESTO en /entity/new o /entity/[id]/edit
<div className="px-4 pb-4 pt-1">
  <Card>
    <CardContent className="pt-6">
      <EntityFormTabs
        entity={entity}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </CardContent>
  </Card>
</div>
```

**✅ CORRECTO - Componente directo sin wrapper:**
```tsx
// ✅ ESTRUCTURA CORRECTA en todas las páginas
<div className="px-4 pb-4 pt-1">
  <EntityFormTabs
    entity={entity}
    onSubmit={handleSubmit}
    isLoading={loading}
  />
</div>

// ✅ Lo mismo aplica para vistas de detalle
<div className="px-4 pb-4 pt-1">
  <EntityDetailTabs entity={entity} />
</div>
```

**Razón**: Los componentes `*FormTabs` y `*DetailTabs` ya renderizan Cards internamente para cada sección (Basic Information, Contact Details, etc.). Envolverlos en otro Card crea una "tarjeta dentro de tarjeta" innecesaria y estructura inconsistente.

---

### 1. Portal Rendering Pattern

**Todas las pestañas usan createPortal para renderizar en sticky header**

```typescript
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export function EntityDetailTabs({ entity }: Props) {
  const [tabsContainer, setTabsContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    const container = document.getElementById('entity-tabs-nav-container')
    setTabsContainer(container)
  }, [])

  const tabsNavigation = (
    <TabsList>
      {/* Tab triggers */}
    </TabsList>
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {tabsContainer && createPortal(tabsNavigation, tabsContainer)}
      {/* Tab contents */}
    </Tabs>
  )
}
```

**Container ID pattern**: `{entity}-tabs-nav-container`
- ✅ `contact-tabs-nav-container`
- ✅ `opportunity-tabs-nav-container`
- ✅ `quote-tabs-nav-container`

---

### 2. Section Filtering Pattern (Forms)

**Formularios con pestañas usan section filtering para mostrar/ocultar campos**

```typescript
export type EntityFormSection = 'general' | 'professional' | 'all'

interface EntityFormProps {
  section?: EntityFormSection // default: 'all'
}

export function EntityForm({ section = 'all' }: EntityFormProps) {
  const showGeneral = section === 'all' || section === 'general'
  const showProfessional = section === 'all' || section === 'professional'

  return (
    <form>
      {showGeneral && (
        <Card>
          {/* General section fields */}
        </Card>
      )}

      {showProfessional && (
        <Card>
          {/* Professional section fields */}
        </Card>
      )}
    </form>
  )
}
```

**Uso en form tabs**:
```typescript
<TabsContent value="general">
  <EntityForm section="general" />
</TabsContent>

<TabsContent value="professional">
  <EntityForm section="professional" />
</TabsContent>
```

---

### 3. Sub-grid Pattern (Accounts)

**Componentes wrapper que fetchean y filtran datos relacionados**

```typescript
export function AccountContactsSubGrid({ accountId }: Props) {
  const { contacts, loading } = useContacts()

  // Filter by account
  const filtered = contacts.filter(
    c => c.parentcustomerid === accountId
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Contacts ({filtered.length})</CardTitle>
        <Button asChild>
          <Link href={`/contacts/new?accountId=${accountId}`}>
            New Contact
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ContactList contacts={filtered} />
      </CardContent>
    </Card>
  )
}
```

---

## STYLING CONSISTENCY

**Todos los tabs usan este estilo unificado**:

```typescript
className={cn(
  "relative rounded-none border-0 px-4 md:px-6 py-3 text-sm font-medium transition-colors",
  "data-[state=active]:bg-transparent data-[state=active]:text-purple-600",
  "data-[state=inactive]:text-gray-500 hover:text-gray-900",
  "data-[state=active]:after:absolute data-[state=active]:after:bottom-0",
  "data-[state=active]:after:left-0 data-[state=active]:after:right-0",
  "data-[state=active]:after:h-0.5 data-[state=active]:after:bg-purple-600"
)}
```

**Características**:
- Fondo transparente
- Texto púrpura (#purple-600) cuando activo
- Texto gris (#gray-500) cuando inactivo
- Subrayado púrpura de 0.5px en tab activo
- Hover effect en tabs inactivos

---

## REGLAS DE NEGOCIO

### Detalle vs Formulario

**Fórmula**: `Form Tabs = Detail Tabs - Activities - Related/Disabled Tabs`

**Ejemplos**:
- **Contacts**: 4 detail tabs → 3 form tabs (sin Activities)
- **Opportunities**: 6 detail tabs → 5 form tabs (sin Activities)
- **Products**: 3 detail tabs → 2 form tabs (sin Related, sin Activities)

### Activities Tab

- ✅ **SIEMPRE** presente en vistas de detalle
- ✅ **NUNCA** presente en formularios de edición/creación
- ✅ Usa componente `ActivityTimeline` de `@/features/activities/components`
- ✅ Props: `regardingId`, `regardingType`, `regardingName`

### Related Tabs

- ✅ Solo en vistas de detalle
- ✅ Deshabilitado si no hay implementación
- ✅ Habilitado cuando hay sub-grids funcionales

---

## CHECKLIST PARA NUEVAS ENTIDADES

Cuando agregues una nueva entidad, asegúrate de:

- [ ] **Detalle**: Primera pestaña es "General" (no "Summary", "Basic", etc.)
- [ ] **Detalle**: Última pestaña es "Activities" con `ActivityTimeline`
- [ ] **Formulario**: No incluir pestaña "Activities"
- [ ] **Formulario**: No incluir pestañas "Related" deshabilitadas
- [ ] **Container ID**: Usar patrón `{entity}-tabs-nav-container`
- [ ] **Portal**: Renderizar navegación en sticky header con `createPortal`
- [ ] **Section filtering**: Implementar si formulario tiene 2+ pestañas
- [ ] **Styling**: Usar className unificado para todos los tabs
- [ ] **Type exports**: Exportar `{Entity}TabId` y opcionalmente `{Entity}FormSection`
