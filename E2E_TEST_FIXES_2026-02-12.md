# E2E Test Fixes - Language Independence

**Fecha**: 2026-02-12
**Problema**: 15/20 tests fallaban por selectores basados en texto traducido
**Solución**: Implementar `data-testid` para selectores independientes del idioma

---

## RESUMEN DE CAMBIOS

### Archivos Modificados: 7
1. `src/features/leads/components/lead-form.tsx` ✅
2. `src/app/(sales)/leads/new/page.tsx` ✅
3. `src/app/(sales)/leads/[id]/page.tsx` ✅
4. `src/features/leads/components/lead-form-tabs.tsx` ✅
5. `src/app/(sales)/orders/[id]/page.tsx` ✅
6. `src/features/orders/components/order-status-badge.tsx` ✅
7. `e2e/pages/leads.page.ts` ✅

### Tests Modificados: 2
1. `e2e/pages/leads.page.ts` ✅
2. `e2e/tests/full-sales-flow.spec.ts` ✅

---

## CAMBIOS DETALLADOS

### 1. Lead Form Inputs (lead-form.tsx)

**Problema**: Tests buscaban `getByLabel(/First Name/i)` pero la UI mostraba "Nombre" (español)

**Solución**: Agregar `data-testid` a todos los campos del formulario

```tsx
// ANTES
<Input
  placeholder={t('form.placeholders.firstName')}
  className="h-10"
  {...field}
/>

// DESPUÉS
<Input
  data-testid="lead-firstname"
  placeholder={t('form.placeholders.firstName')}
  className="h-10"
  {...field}
/>
```

**Campos actualizados**:
- ✅ `lead-firstname` - First Name input
- ✅ `lead-lastname` - Last Name input
- ✅ `lead-company` - Company input (IconInput)
- ✅ `lead-jobtitle` - Job Title input
- ✅ `lead-email` - Email input (IconInput)
- ✅ `lead-phone` - Phone input (IconInput)
- ✅ `lead-mobile` - Mobile input (IconInput)
- ✅ `lead-website` - Website input (IconInput)

---

### 2. Lead Form Buttons

**Problema**: Tests buscaban botones por texto traducido

**Solución**: Agregar `data-testid` a botones de acción

#### Create Lead Button (leads/new/page.tsx)
```tsx
<Button
  data-testid="create-lead-button"
  onClick={() => {
    const form = document.getElementById('lead-edit-form') as HTMLFormElement
    form?.requestSubmit()
  }}
  disabled={loading}
  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Create Lead
</Button>
```

#### Qualify Lead Button (leads/[id]/page.tsx)
```tsx
<Button
  data-testid="qualify-lead-button"
  onClick={() => setQualifyDialogOpen(true)}
  disabled={mutating}
  className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
>
  <CheckCircle2 className="mr-2 h-4 w-4" />
  {tc('actions.qualifyLead')}
</Button>
```

---

### 3. Lead Form Tabs

**Problema**: Tests buscaban tabs por texto traducido (`getByRole('tab', { name: /general/i })`)

**Solución**: Agregar `data-testid` a cada tab trigger

```tsx
// General Tab
<TabsTrigger
  value="general"
  data-testid="tab-general"
  className={...}
>
  <User className="w-4 h-4 mr-2" />
  {tc('tabs.general')}
</TabsTrigger>

// Qualification Tab
<TabsTrigger
  value="qualification"
  data-testid="tab-qualification"
  className={...}
>
  <CheckCircle2 className="w-4 h-4 mr-2" />
  {tc('tabs.qualification')}
</TabsTrigger>

// Address Tab
<TabsTrigger
  value="address"
  data-testid="tab-address"
  className={...}
>
  <MapPin className="w-4 h-4 mr-2" />
  {tc('tabs.address')}
</TabsTrigger>

// Notes Tab
<TabsTrigger
  value="notes"
  data-testid="tab-notes"
  className={...}
>
  <FileText className="w-4 h-4 mr-2" />
  {tc('tabs.notes')}
</TabsTrigger>
```

**Tabs actualizados**:
- ✅ `tab-general`
- ✅ `tab-qualification`
- ✅ `tab-address`
- ✅ `tab-notes`

---

### 4. Order Submit Dialog Button

**Problema**: Test buscaba `getByRole('button', { name: /submit order/i })` en el diálogo de confirmación

**Solución**: Agregar `data-testid` al botón de confirmación

```tsx
// orders/[id]/page.tsx
<AlertDialogAction
  data-testid="confirm-submit-order-button"
  className="bg-blue-600 hover:bg-blue-700"
  onClick={handleSubmitOrder}
  disabled={submitMutation.isPending}
>
  {submitMutation.isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Submitting...
    </>
  ) : (
    tc('actions.submitOrder')
  )}
</AlertDialogAction>
```

---

### 5. Order Status Badge

**Problema**: Tests buscaban `getByText('Fulfilled')` pero el estado estaba traducido

**Solución**: Agregar `data-testid` dinámico basado en OrderStateCode

```tsx
// order-status-badge.tsx
const getTestId = () => {
  switch (statecode) {
    case OrderStateCode.Active:
      return 'order-status-active'
    case OrderStateCode.Submitted:
      return 'order-status-submitted'
    case OrderStateCode.Canceled:
      return 'order-status-canceled'
    case OrderStateCode.Fulfilled:
      return 'order-status-fulfilled'
    case OrderStateCode.Invoiced:
      return 'order-status-invoiced'
    default:
      return 'order-status-unknown'
  }
}

return (
  <Badge
    data-testid={getTestId()}
    variant={config.variant}
    className={cn(config.className, className)}
  >
    {config.label}
  </Badge>
)
```

**Status TestIDs disponibles**:
- ✅ `order-status-active` - Active (0)
- ✅ `order-status-submitted` - Submitted (1)
- ✅ `order-status-canceled` - Canceled (2)
- ✅ `order-status-fulfilled` - Fulfilled (3)
- ✅ `order-status-invoiced` - Invoiced (4)

---

### 6. Page Object Updates (leads.page.ts)

**Cambios**: Reemplazar selectores basados en texto con `data-testid`

```typescript
// ANTES - Basado en labels traducidos
this.firstNameInput = page.getByLabel(/First Name/i)
this.lastNameInput = page.getByLabel(/Last Name/i)
this.companyInput = page.getByLabel(/^Company$/i)

// DESPUÉS - Independiente del idioma
this.firstNameInput = page.getByTestId('lead-firstname')
this.lastNameInput = page.getByTestId('lead-lastname')
this.companyInput = page.getByTestId('lead-company')
```

**Selectores actualizados**:
- ✅ Form inputs: `getByTestId('lead-*')`
- ✅ Buttons: `getByTestId('create-lead-button')`, `getByTestId('qualify-lead-button')`
- ✅ Tabs: `getByTestId('tab-*')`

---

### 7. Test Updates (full-sales-flow.spec.ts)

**Cambios en selectores de Order tests**:

```typescript
// ANTES - Submit Order button
const confirmButton = dialog.getByRole('button', { name: /submit order/i })

// DESPUÉS
const confirmButton = dialog.getByTestId('confirm-submit-order-button')

// ANTES - Order status
await expect(page.getByText('Submitted').first()).toBeVisible()
await expect(page.getByText('Fulfilled').first()).toBeVisible()

// DESPUÉS
await expect(page.getByTestId('order-status-submitted')).toBeVisible()
await expect(page.getByTestId('order-status-fulfilled')).toBeVisible()
```

---

## BENEFICIOS DE LA SOLUCIÓN

### ✅ Independencia del Idioma
- Tests funcionan en cualquier idioma (EN, ES, etc.)
- No requieren actualización al cambiar traducciones
- Más robustos a cambios de copia/UX

### ✅ Mejores Prácticas
- Sigue estándares de testing (data-testid)
- Selectores explícitos y mantenibles
- Reduce flakiness de tests

### ✅ Mantenibilidad
- Fácil identificar elementos en tests
- Debugging más simple
- Cambios de UI no rompen tests innecesariamente

---

## PATRÓN IMPLEMENTADO

### Componente
```tsx
// ✅ CORRECTO: Agregar data-testid a elementos interactivos
<Input
  data-testid="entity-fieldname"
  {...field}
/>

<Button
  data-testid="action-entity-button"
  onClick={handleAction}
>
  {t('actions.doSomething')}
</Button>

<Badge data-testid={`entity-status-${statusCode}`}>
  {t(`status.${statusCode}`)}
</Badge>
```

### Page Object
```typescript
// ✅ CORRECTO: Usar getByTestId
this.field = page.getByTestId('entity-fieldname')
this.button = page.getByTestId('action-entity-button')
this.statusBadge = page.getByTestId('entity-status-active')
```

### Test
```typescript
// ✅ CORRECTO: Selectores confiables
await expect(page.getByTestId('entity-fieldname')).toBeVisible()
await page.getByTestId('action-entity-button').click()
await expect(page.getByTestId('entity-status-active')).toBeVisible()
```

---

## CONVENCIONES DE NAMING

### data-testid Format
```
{entity}-{field/action/status}-{detail}
```

**Ejemplos**:
- Inputs: `lead-firstname`, `quote-customer`, `order-total`
- Buttons: `create-lead-button`, `qualify-lead-button`, `submit-order-button`
- Tabs: `tab-general`, `tab-qualification`, `tab-activities`
- Status: `order-status-fulfilled`, `quote-status-won`
- Dialogs: `confirm-submit-order-button`, `cancel-order-dialog`

---

## TESTS AFECTADOS (15 → 0 fallidos esperados)

### Lead Tests (12 tests)
1. ✅ Create B2B lead with company
2. ✅ Create B2C lead without company
3. ✅ Validation error - first name empty
4. ✅ Validation error - last name empty
5. ✅ Show qualify button on lead detail
6. ✅ Open qualify dialog
7. ✅ Close qualification dialog
8. ✅ Navigate from dashboard to create lead
9. ✅ Navigate to lead detail from list
10. ✅ Have all form tabs
11. ✅ Switch between tabs
12. ✅ Qualify B2B lead (full flow)

### Order Tests (3 tests)
13. ✅ Submit active order
14. ✅ Fulfill submitted order
15. ✅ Generate invoice from fulfilled order

---

## PRÓXIMOS PASOS

### Aplicar mismo patrón a otros dominios:
- [ ] Quotes (status badges, buttons)
- [ ] Opportunities (status badges, stage buttons)
- [ ] Accounts (form fields, tabs)
- [ ] Contacts (form fields, tabs)
- [ ] Invoices (status badges, payment button)
- [ ] Activities (form fields, type selector)

### Crear guía de estándares:
- [ ] Documentar convenciones de data-testid
- [ ] Agregar a CLAUDE.md o docs/TESTING.md
- [ ] Crear checklist para nuevos componentes

---

## VERIFICACIÓN

### Build
```bash
npm run build
```
✅ **PASSED** - Exit code 0, 55s compilation time

### E2E Tests
```bash
npm run test:e2e
```
⏳ **RUNNING** - Esperando resultados...

---

## RECURSOS

- **Playwright Testing Library**: https://playwright.dev/docs/locators#locate-by-test-id
- **Testing Best Practices**: https://kentcdodds.com/blog/common-mistakes-with-react-testing-library
- **data-testid Convention**: https://testing-library.com/docs/queries/bytestid/

---

**Mantenido por**: Claude Code
**Última actualización**: 2026-02-12 19:00 UTC
**Status**: ✅ Build passing, ⏳ E2E tests running
