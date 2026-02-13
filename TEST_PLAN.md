# Plan de Pruebas Completo - CRM Sales System

**Fecha**: 2026-02-12
**Objetivo**: Validar funcionalidades implementadas recientemente y flujos críticos del sistema

---

## 1. PRUEBAS AUTOMATIZADAS (E2E - Playwright)

### 1.1 Lead to Opportunity Flow
- ✓ Creación de Lead B2B (con company)
- ✓ Creación de Lead B2C (sin company)
- ✓ Validación de formularios (first name, last name required)
- ✓ Botón de calificación visible en lead detail
- ✓ Apertura de diálogo de calificación
- ✓ Navegación entre pestañas del formulario
- ✓ Calificación completa con wizard BANT → Account → Contact → Opportunity

### 1.2 Quote-to-Cash Flow
- ✓ Win Quote y crear Order
- ✓ Submit Order
- ✓ Fulfill Order
- ✓ Generar Invoice desde Order
- ✓ Marcar Invoice como Paid
- ✓ Navegación entre entidades (Quotes, Orders, Invoices)

**Comando**: `npm run test:e2e`

---

## 2. PRUEBAS MANUALES - FUNCIONALIDADES RECIENTES

### 2.1 Quote Customer Validation ⭐ (Implementado hoy)

**Objetivo**: Verificar que no se pueda crear Quote sin asignar un Customer

**Pasos**:
1. Ir a `/quotes/templates`
2. Seleccionar un template (ej: "Enterprise Package")
3. Click en "Use Template"
4. **NO seleccionar ningún Account o Contact**
5. Click en "Create Quote"

**Resultado Esperado**:
- ❌ El formulario NO debe enviarse
- ✅ Debe mostrar error: "Please select a customer (Account or Contact) for this quote"
- ✅ El campo customer debe tener borde rojo
- ✅ El foco debe ir al customer selector

**Archivos modificados**: `quote-form-tabs.tsx`, locales EN/ES

---

### 2.2 Quote Edit - Customer Preselection ⭐ (Implementado hoy)

**Objetivo**: Verificar que el customer se muestre correctamente al editar una Quote

**Pasos**:
1. Crear una Quote desde template con Account asignado
2. Ir a la Quote detail page
3. Click en "Edit"
4. Observar el campo "Customer"

**Resultado Esperado**:
- ✅ Debe mostrar el nombre completo del Account o Contact
- ✅ Debe mostrar el email
- ✅ Debe mostrar el teléfono
- ✅ NO solo debe mostrarse un icono vacío

**Archivos modificados**: `quote-form-tabs.tsx` (useAccount/useContact hooks, useEffect population)

---

### 2.3 Order Name with Creation Date ⭐ (Implementado hoy)

**Objetivo**: Verificar que el Order generado desde Quote incluya fecha de creación

**Pasos**:
1. Ir a una Quote en estado "Won" (ej: `/quotes/quote-002`)
2. Click en "Create Order from Quote"
3. Confirmar en el diálogo
4. Observar el nombre del Order creado

**Resultado Esperado**:
- ✅ Nombre del Order debe ser: `{quote.name} - {DD-MM-YYYY}`
- ✅ Ejemplo: "CRM Enterprise Implementation - Acme Corp - 12-02-2026"
- ✅ Formato de fecha: día-mes-año con guiones

**Archivos modificados**: `order-service-mock.ts` (createFromQuote method)

---

### 2.4 Quote → Order 1:1 Relationship ⭐ (Implementado previamente)

**Objetivo**: Verificar que solo se pueda crear 1 Order por Quote Won

**Escenario 1: Primera creación de Order**
1. Ir a una Quote en estado "Won" sin Orders previos
2. El botón "Create Order from Quote" debe estar **enabled**
3. Click en "Create Order from Quote"
4. Confirmar diálogo
5. Verificar que se crea el Order y navega a Order detail

**Escenario 2: Order ya existe (Active)**
1. Regresar a la misma Quote
2. El botón "Create Order from Quote" debe estar **disabled**
3. Debe mostrar Alert: "Order already exists for this quote"
4. Debe mostrar link al Order existente

**Escenario 3: Order cancelado**
1. Si existe un Order Canceled de la Quote
2. El botón "Create Order from Quote" debe estar **enabled**
3. Debe mostrar Warning: "A cancelled order exists..."

**Archivos**: `create-order-from-quote-button.tsx`, `use-orders.tsx`

---

## 3. PRUEBAS DE REGRESIÓN

### 3.1 Lead Qualification Flow
1. Crear Lead B2B → Qualify → Verificar Account + Contact + Opportunity creados
2. Crear Lead B2C → Qualify → Verificar Contact + Opportunity (sin Account)

### 3.2 Quote Template Flow
1. Crear Quote desde template
2. Asignar customer
3. Agregar líneas
4. Win Quote
5. Create Order

### 3.3 Order Fulfillment Flow
1. Order Active → Submit
2. Order Submitted → Fulfill
3. Order Fulfilled → Generate Invoice

### 3.4 Invoice Payment Flow
1. Invoice Active → Mark as Paid
2. Invoice Paid → Download PDF

---

## 4. VALIDACIÓN DE BUILD

**Comando**: `npm run build`

**Verificación**:
- ✅ Build exitoso (exit code 0)
- ✅ Sin errores TypeScript
- ✅ Sin warnings críticos
- ✅ Bundle sizes dentro de target (< 180KB)

**Última ejecución**: 2026-02-12 ✅ PASSED (49s)

---

## 5. CHECKLIST DE CALIDAD

### Contratos CDS
- [x] Tipos de `core/contracts` usados correctamente
- [x] Enums CDS (OrderStateCode, QuoteStateCode) usados en vez de strings mágicos

### Performance
- [x] Server Components sin `'use client'` innecesario
- [x] React.memo en componentes de lista
- [x] useMemo/useCallback en computaciones
- [x] Dynamic imports para modales

### Arquitectura
- [x] Features NO importan de otros features
- [x] Shared solo contiene código usado por 2+ features
- [x] Clean Architecture respetada

### i18n
- [x] Todas las strings traducidas (EN/ES)
- [x] No hardcoded strings en componentes
- [x] useTranslation('domain') usado correctamente

---

## 6. AMBIENTE DE PRUEBAS

**URL Local**: http://localhost:3000

**Usuarios de prueba** (NextAuth):
- Email: test@example.com
- Password: password123

**Datos mock**:
- Leads: `mock-leads.ts`
- Accounts: `mock-accounts.ts`
- Quotes: `mock-quotes.ts`
- Orders: `mock-orders.ts`

---

## 7. COBERTURA DE TESTS

### E2E Tests (Playwright)
- **Archivos**: 2 specs
  - `lead-to-opportunity.spec.ts` (9 tests)
  - `full-sales-flow.spec.ts` (8 tests)
- **Total**: 17 tests E2E

### Unit Tests (Vitest)
- **Comando**: `npm run test`
- **Estado**: Por implementar (setup configurado)

---

## 8. PRÓXIMOS PASOS

1. **Ejecutar tests E2E**: `npm run test:e2e`
2. **Revisar resultados** y corregir fallos
3. **Pruebas manuales** de funcionalidades nuevas (sección 2)
4. **Verificar i18n** en ambos idiomas (EN/ES)
5. **Performance check** con Lighthouse
6. **Crear unit tests** para lógica de negocio crítica

---

## ESTADO ACTUAL

✅ **Build**: Passing (0 errors, 0 warnings)
⏳ **E2E Tests**: Pendiente ejecutar
⏳ **Manual Tests**: Pendiente ejecutar
✅ **i18n**: EN/ES completo para 7 dominios (leads, opps, accounts, contacts, quotes, orders, invoices)

---

**Mantenido por**: Claude Code
**Última actualización**: 2026-02-12
