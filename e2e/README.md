# E2E Tests - CRM Sales Application

> Pruebas End-to-End para el flujo de ventas Lead → Opportunity usando Playwright Test.

---

## Estructura del Proyecto

```
e2e/
├── fixtures/               # Datos de prueba
│   └── test-data.ts        # Datos para leads B2B/B2C
├── pages/                  # Page Object Model (POM)
│   ├── index.ts            # Exports centralizados
│   ├── leads.page.ts       # Acciones y locators de Leads
│   ├── qualify-dialog.page.ts  # Diálogo de calificación
│   └── opportunities.page.ts   # Acciones de Opportunities
├── tests/                  # Archivos de tests
│   └── lead-to-opportunity.spec.ts  # Tests del flujo principal
└── README.md               # Esta documentación
```

---

## Flujo de Negocio Testeado

El flujo sigue el modelo **CDS (Common Data Service)** de Microsoft Dynamics 365 Sales:

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEAD QUALIFICATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Lead (Open)                                                    │
│       │                                                          │
│       ▼                                                          │
│   [Qualify Button]                                               │
│       │                                                          │
│       ▼                                                          │
│   ┌─────────────────────────────────────────┐                   │
│   │     Qualification Dialog                 │                   │
│   │                                          │                   │
│   │  ┌─────────────┐  ┌─────────────┐       │                   │
│   │  │   Account   │  │   Contact   │       │                   │
│   │  │  (B2B only) │  │  (Always)   │       │                   │
│   │  │ ○ Create    │  │ ○ Create    │       │                   │
│   │  │ ○ Existing  │  │ ○ Existing  │       │                   │
│   │  └─────────────┘  └─────────────┘       │                   │
│   │                                          │                   │
│   │  ┌─────────────────────────────┐        │                   │
│   │  │      Opportunity            │        │                   │
│   │  │  - Name                     │        │                   │
│   │  │  - Estimated Value          │        │                   │
│   │  │  - Close Date               │        │                   │
│   │  └─────────────────────────────┘        │                   │
│   └─────────────────────────────────────────┘                   │
│       │                                                          │
│       ▼                                                          │
│   [Submit Qualification]                                         │
│       │                                                          │
│       ├── B2B: Account + Contact + Opportunity                   │
│       └── B2C: Contact + Opportunity                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Comandos de Ejecución

| Comando | Descripción |
|---------|-------------|
| `npm run test:e2e` | Ejecutar todos los tests (headless) |
| `npm run test:e2e:ui` | Abrir UI interactiva de Playwright |
| `npm run test:e2e:headed` | Ejecutar con navegador visible |
| `npm run test:e2e:debug` | Modo debug paso a paso |
| `npm run test:e2e:report` | Ver reporte HTML de última ejecución |

### Ejemplos de Uso

```bash
# Ejecutar solo tests de B2B
npm run test:e2e -- --grep "B2B"

# Ejecutar solo tests de B2C
npm run test:e2e -- --grep "B2C"

# Ejecutar un test específico
npm run test:e2e -- --grep "should qualify B2B lead"

# Ejecutar con reintentos
npm run test:e2e -- --retries=2

# Generar trace para debugging
npm run test:e2e -- --trace on
```

---

## Tests Implementados

### 1. B2B Lead Qualification (`lead-to-opportunity.spec.ts`)

| Test | Descripción | Entidades Creadas |
|------|-------------|-------------------|
| `should create lead and navigate to detail page` | Crear lead B2B con empresa | Lead |
| `should show qualify button on lead detail` | Verificar botón Qualify visible | - |
| `should open qualify dialog with B2B options` | Verificar diálogo tiene sección Account | - |
| `should qualify B2B lead creating Account + Contact + Opportunity` | Flujo completo B2B | Account, Contact, Opportunity |

### 2. B2C Lead Qualification

| Test | Descripción | Entidades Creadas |
|------|-------------|-------------------|
| `should create B2C lead without company` | Crear lead sin empresa | Lead |
| `should qualify B2C lead creating Contact + Opportunity only` | Flujo B2C (sin Account) | Contact, Opportunity |

### 3. Validation Tests

| Test | Descripción |
|------|-------------|
| `should show warning when BANT fields are missing` | Validar campos BANT requeridos |
| `should require opportunity name` | Validar nombre de oportunidad obligatorio |

### 4. Integration Tests

| Test | Descripción |
|------|-------------|
| `full B2B flow: Dashboard → Create Lead → Qualify → View Opportunity` | Flujo completo desde dashboard |

---

## Page Objects

### LeadsPage (`pages/leads.page.ts`)

Maneja todas las operaciones relacionadas con Leads.

```typescript
import { LeadsPage } from '../pages'

const leadsPage = new LeadsPage(page)

// Navegación
await leadsPage.goto()           // Ir a lista de leads
await leadsPage.gotoNew()        // Ir a formulario nuevo
await leadsPage.gotoDetail('1')  // Ir a detalle de lead

// Crear lead
await leadsPage.fillBasicInfo({
  firstName: 'John',
  lastName: 'Doe',
  company: 'Acme Inc',
  email: 'john@acme.com'
})

// Llenar BANT
await leadsPage.fillBANTQualification({
  budgetAmount: 50000,
  budgetStatus: 'Can Buy',
  purchaseTimeframe: 'This Quarter',
  needAnalysis: 'Looking for CRM solution',
  decisionMaker: 'Yes'
})

// Crear lead completo
await leadsPage.createLead({ ...allData })

// Abrir diálogo de calificación
await leadsPage.openQualifyDialog()
```

### QualifyDialogPage (`pages/qualify-dialog.page.ts`)

Maneja el diálogo de calificación de leads.

```typescript
import { QualifyDialogPage } from '../pages'

const qualifyDialog = new QualifyDialogPage(page)

// Esperar a que aparezca el diálogo
await qualifyDialog.waitForDialog()

// Verificar si es B2B
const isB2B = await qualifyDialog.isB2B()

// Configurar Account (solo B2B)
await qualifyDialog.configureAccount('create')  // 'create' | 'existing'

// Configurar Contact
await qualifyDialog.configureContact('create')  // 'create' | 'existing'

// Llenar datos de Opportunity
await qualifyDialog.fillOpportunityDetails({
  name: 'New Opportunity',
  estimatedValue: 75000,
  description: 'Description here'
})

// Enviar calificación
await qualifyDialog.submitQualification()

// Esperar éxito
await qualifyDialog.waitForSuccess()

// Flujo completo con valores por defecto
await qualifyDialog.qualifyWithDefaults({
  name: 'Custom Opportunity Name'
})

// Ir a la oportunidad creada
await qualifyDialog.goToOpportunity()
```

### OpportunitiesPage (`pages/opportunities.page.ts`)

Verifica las oportunidades creadas.

```typescript
import { OpportunitiesPage } from '../pages'

const opportunitiesPage = new OpportunitiesPage(page)

// Navegación
await opportunitiesPage.goto()
await opportunitiesPage.gotoDetail('1')

// Verificaciones
await opportunitiesPage.expectOnDetailPage()
await opportunitiesPage.expectOpportunityName('My Opportunity')
await opportunitiesPage.expectSalesStage('Qualify')
await opportunitiesPage.expectFromLeadQualification()
```

---

## Fixtures - Datos de Prueba

### Datos Predefinidos (`fixtures/test-data.ts`)

```typescript
import { testLeads, testOpportunity, generateUniqueLeadData } from '../fixtures/test-data'

// Lead B2B predefinido
const b2bLead = testLeads.b2bLead

// Lead B2C predefinido
const b2cLead = testLeads.b2cLead

// Generar datos únicos (evita conflictos)
const uniqueB2B = generateUniqueLeadData('b2b')
const uniqueB2C = generateUniqueLeadData('b2c')

// Datos de oportunidad
const oppData = testOpportunity
```

### Campos BANT (Budget, Authority, Need, Timeline)

Los leads requieren estos campos para ser calificados:

| Campo | Descripción | Valores |
|-------|-------------|---------|
| `budgetAmount` | Presupuesto disponible | Número > 0 |
| `budgetStatus` | Estado del presupuesto | No Committed, May Buy, Can Buy |
| `purchaseTimeframe` | Plazo de compra | Immediate, This Quarter, This Year, Unknown |
| `needAnalysis` | Análisis de necesidades | Texto descriptivo |
| `decisionMaker` | Es tomador de decisiones | Yes, No, Unknown |

---

## Configuración (`playwright.config.ts`)

```typescript
// Configuración principal
{
  testDir: './e2e',           // Directorio de tests
  fullyParallel: true,        // Tests en paralelo
  retries: process.env.CI ? 2 : 0,  // Reintentos en CI

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',      // Trace solo en retry
    screenshot: 'only-on-failure', // Screenshots en fallos
    video: 'on-first-retry',      // Video en retry
  },

  // Inicia servidor de desarrollo automáticamente
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
}
```

---

## Extender los Tests

### Agregar nuevo test

```typescript
// e2e/tests/my-new-test.spec.ts
import { test, expect } from '@playwright/test'
import { LeadsPage, OpportunitiesPage } from '../pages'

test.describe('My New Feature', () => {
  test('should do something', async ({ page }) => {
    const leadsPage = new LeadsPage(page)

    // Tu test aquí
  })
})
```

### Agregar nuevo Page Object

```typescript
// e2e/pages/my-page.page.ts
import { Page, Locator, expect } from '@playwright/test'

export class MyPage {
  readonly page: Page
  readonly myElement: Locator

  constructor(page: Page) {
    this.page = page
    this.myElement = page.getByRole('button', { name: 'My Button' })
  }

  async doSomething() {
    await this.myElement.click()
  }
}

// No olvides exportar en pages/index.ts
export { MyPage } from './my-page.page'
```

### Agregar nuevos fixtures

```typescript
// e2e/fixtures/my-fixtures.ts
export const myTestData = {
  // Tus datos aquí
}
```

---

## Troubleshooting

### El servidor no inicia

```bash
# Verificar que el puerto 3000 esté libre
npx kill-port 3000

# O ejecutar el servidor manualmente primero
npm run dev
```

### Tests fallan por timeouts

```bash
# Aumentar timeout global
npm run test:e2e -- --timeout=60000
```

### Elementos no encontrados

1. Verificar que los selectores sean correctos usando `test:e2e:debug`
2. Usar `page.pause()` para inspeccionar el DOM
3. Actualizar los Page Objects si la UI cambió

### Ver trace de errores

```bash
# Ejecutar con trace
npm run test:e2e -- --trace on

# Abrir trace viewer
npx playwright show-trace trace.zip
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Referencias

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Page Object Model](https://playwright.dev/docs/pom)
- [CDS Model Reference](../docs/CDS_MODEL.md)
- [Tab Standardization](../docs/TAB_STANDARDIZATION.md)
