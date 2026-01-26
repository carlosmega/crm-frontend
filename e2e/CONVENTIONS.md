# Convenciones E2E - CRM Sales

> Guía de mejores prácticas para escribir tests E2E consistentes y mantenibles.

---

## Estructura de Tests

### Naming Convention

```typescript
// Archivos de test: kebab-case con sufijo .spec.ts
lead-to-opportunity.spec.ts
quote-to-order.spec.ts
user-authentication.spec.ts

// Page Objects: kebab-case con sufijo .page.ts
leads.page.ts
opportunities.page.ts
qualify-dialog.page.ts

// Fixtures: kebab-case
test-data.ts
auth-fixtures.ts
```

### Organización de Tests

```typescript
test.describe('Feature Name', () => {
  // Setup compartido
  let pageObject: MyPage

  test.beforeEach(async ({ page }) => {
    pageObject = new MyPage(page)
  })

  // Agrupar por escenario
  test.describe('Scenario A', () => {
    test('should do X when Y', async () => {})
    test('should do Z when W', async () => {})
  })

  test.describe('Scenario B', () => {
    test('should handle error case', async () => {})
  })
})
```

---

## Page Object Model

### Principios

1. **Un Page Object por vista/componente principal**
2. **Encapsular selectores** - nunca usar selectores directamente en tests
3. **Métodos descriptivos** - nombres que describan la acción del usuario
4. **Retornar Page Objects** - para encadenar acciones

### Estructura Recomendada

```typescript
import { Page, Locator, expect } from '@playwright/test'

export class ExamplePage {
  // 1. Propiedades
  readonly page: Page

  // 2. Locators (agrupados por sección)
  // -- Navigation
  readonly navLink: Locator

  // -- Form fields
  readonly nameInput: Locator
  readonly emailInput: Locator

  // -- Actions
  readonly submitButton: Locator
  readonly cancelButton: Locator

  // 3. Constructor
  constructor(page: Page) {
    this.page = page

    // Preferir getByRole, getByLabel, getByText
    this.navLink = page.getByRole('link', { name: 'Example' })
    this.nameInput = page.getByLabel('Name')
    this.emailInput = page.getByRole('textbox', { name: /email/i })
    this.submitButton = page.getByRole('button', { name: 'Submit' })
    this.cancelButton = page.getByRole('button', { name: 'Cancel' })
  }

  // 4. Navigation methods
  async goto() {
    await this.page.goto('/example')
    await this.page.waitForLoadState('networkidle')
  }

  // 5. Action methods (verbos de acción)
  async fillForm(data: { name: string; email: string }) {
    await this.nameInput.fill(data.name)
    await this.emailInput.fill(data.email)
  }

  async submit() {
    await this.submitButton.click()
  }

  // 6. Composite methods (flujos completos)
  async createExample(data: { name: string; email: string }) {
    await this.goto()
    await this.fillForm(data)
    await this.submit()
  }

  // 7. Assertion methods (prefijo: expect)
  async expectSuccess() {
    await expect(this.page.getByText('Success')).toBeVisible()
  }

  async expectError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible()
  }
}
```

---

## Selectores

### Orden de Preferencia

```typescript
// 1. Role (mejor accesibilidad)
page.getByRole('button', { name: 'Submit' })
page.getByRole('textbox', { name: 'Email' })
page.getByRole('link', { name: 'Home' })

// 2. Label (formularios)
page.getByLabel('Email address')
page.getByLabel(/password/i)

// 3. Text (contenido visible)
page.getByText('Welcome back')
page.getByText(/error/i)

// 4. Placeholder
page.getByPlaceholder('Enter your email')

// 5. Test ID (último recurso)
page.getByTestId('submit-button')
page.locator('[data-testid="custom-element"]')
```

### Evitar

```typescript
// ❌ Selectores frágiles
page.locator('.btn-primary')
page.locator('#submit')
page.locator('div > span > button')
page.locator(':nth-child(2)')

// ✅ Selectores robustos
page.getByRole('button', { name: 'Submit' })
```

---

## Assertions

### Usar expect de Playwright

```typescript
import { expect } from '@playwright/test'

// Visibilidad
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).not.toBeVisible()

// Contenido
await expect(element).toHaveText('Expected text')
await expect(element).toContainText('partial')
await expect(element).toHaveValue('input value')

// Estado
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toBeChecked()

// URL
await expect(page).toHaveURL('/expected-path')
await expect(page).toHaveURL(/regex-pattern/)

// Título
await expect(page).toHaveTitle('Page Title')
```

### Timeouts Explícitos

```typescript
// Cuando necesitas más tiempo
await expect(element).toBeVisible({ timeout: 10000 })

// Esperas explícitas (usar con moderación)
await page.waitForURL('/new-page')
await page.waitForLoadState('networkidle')
await page.waitForSelector('[data-loaded="true"]')
```

---

## Datos de Prueba

### Generar Datos Únicos

```typescript
// ✅ Datos únicos para evitar conflictos
function generateUniqueData() {
  const timestamp = Date.now()
  return {
    name: `Test-${timestamp}`,
    email: `test-${timestamp}@example.com`,
  }
}

// ❌ Datos hardcodeados que pueden colisionar
const data = {
  name: 'Test User',
  email: 'test@example.com',
}
```

### Fixtures Tipados

```typescript
// fixtures/types.ts
export interface LeadTestData {
  firstName: string
  lastName: string
  company?: string
  email: string
  budgetAmount?: number
}

// fixtures/leads.ts
export const validB2BLead: LeadTestData = {
  firstName: 'Test',
  lastName: 'User',
  company: 'Test Corp',
  email: 'test@corp.com',
  budgetAmount: 50000,
}
```

---

## Patrones Comunes

### Setup y Teardown

```typescript
test.describe('Feature', () => {
  // Ejecutar antes de cada test
  test.beforeEach(async ({ page }) => {
    await page.goto('/start')
  })

  // Ejecutar después de cada test
  test.afterEach(async ({ page }) => {
    // Cleanup si es necesario
  })

  // Ejecutar una vez antes de todos los tests
  test.beforeAll(async () => {
    // Setup global (ej: seed database)
  })

  // Ejecutar una vez después de todos los tests
  test.afterAll(async () => {
    // Cleanup global
  })
})
```

### Tests Condicionales

```typescript
// Skip en ciertas condiciones
test.skip(process.env.CI === 'true', 'Skip in CI')

// Solo ejecutar en ciertas condiciones
test.fixme('Known bug - fix pending')

// Marcar como lento
test.slow()
```

### Retry Logic

```typescript
// En playwright.config.ts
{
  retries: process.env.CI ? 2 : 0,
}

// Por test específico
test('flaky test', async ({ page }) => {
  test.info().annotations.push({ type: 'retry', description: 'Known flaky' })
  // ...
})
```

---

## Anti-Patterns

### Evitar

```typescript
// ❌ Sleeps hardcodeados
await page.waitForTimeout(5000)

// ✅ Esperar condiciones específicas
await expect(element).toBeVisible()
await page.waitForLoadState('networkidle')


// ❌ Tests dependientes entre sí
test('create item', async () => { /* crea item */ })
test('edit item', async () => { /* asume que item existe */ })

// ✅ Tests independientes
test('edit item', async () => {
  // Setup: crear item primero
  await createItem()
  // Test: editar
  await editItem()
})


// ❌ Assertions múltiples sin contexto
await expect(page.locator('.item')).toHaveCount(5)

// ✅ Assertions descriptivas
await expect(
  page.getByRole('listitem'),
  'Should show 5 items after filtering'
).toHaveCount(5)


// ❌ Selectores en el test
await page.locator('button.submit-btn').click()

// ✅ Usar Page Object
await myPage.submitButton.click()
```

---

## Debugging

### Herramientas

```bash
# UI Mode (recomendado para desarrollo)
npm run test:e2e:ui

# Debug con Playwright Inspector
npm run test:e2e:debug

# Ver trace de ejecución
npm run test:e2e -- --trace on
npx playwright show-trace trace.zip
```

### En el Código

```typescript
test('debug example', async ({ page }) => {
  // Pausar ejecución para inspeccionar
  await page.pause()

  // Log en consola
  console.log(await element.textContent())

  // Screenshot manual
  await page.screenshot({ path: 'debug.png' })
})
```

---

## Checklist para Nuevos Tests

- [ ] Test tiene nombre descriptivo (`should X when Y`)
- [ ] Usa Page Objects (no selectores directos)
- [ ] Datos de prueba son únicos
- [ ] No depende de otros tests
- [ ] Assertions son específicas y claras
- [ ] No usa `waitForTimeout` con valores hardcodeados
- [ ] Maneja estados de carga correctamente
- [ ] Funciona en modo headless
- [ ] Documentado si es complejo
