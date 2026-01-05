# CDS Model - Common Data Service

> **Referencia completa del modelo de datos basado en Microsoft Dynamics 365 Sales**

---

## 📊 FLUJO COMPLETO DEL CICLO DE VENTAS (QUOTE-TO-CASH)

```
┌─────────┐
│  LEAD   │  Cliente Potencial
│         │  statecode: Open (0)
└────┬────┘
     │
     │ QUALIFY (crear/vincular Account + Contact)
     ▼
┌─────────────┐
│    LEAD     │  statecode: Qualified (1)
│ (qualified) │  originatingleadid → vincula a Opportunity
└─────────────┘
     │
     │ Creates
     ▼
┌──────────────────────────────────────────┐
│  OPPORTUNITY                             │
│  - customerid: Account (B2B) o           │
│                Contact (B2C)             │
│  - salesstage: Qualify (25%) →           │
│                Develop (50%) →           │
│                Propose (75%) →           │
│                Close (100%/0%)           │
└────┬─────────────────────────────────────┘
     │
     │ Create Quote
     ▼
┌─────────┐
│  QUOTE  │  Cotización formal (con líneas de producto)
│         │  - Quote Lines (productos, precios, cantidades)
└────┬────┘
     │
     │ Win Opportunity + Activate Quote
     ▼
┌─────────┐
│  ORDER  │  Pedido confirmado
│         │  - Order Lines (desde Quote Lines)
└────┬────┘
     │
     │ Fulfill Order
     ▼
┌─────────┐
│ INVOICE │  Factura
│         │  - Invoice Lines (desde Order Lines)
└─────────┘
```

---

## ENTIDADES PRINCIPALES

### 1. Lead (Cliente Potencial)

**Propósito**: Primer contacto con posible cliente

**Estados**: `Open (0)` → `Qualified (1)` / `Disqualified (2)`

**Atributos clave**:
- `leadid`
- `firstname`, `lastname`, `companyname`
- `leadsourcecode`, `leadqualitycode`
- `emailaddress1`, `telephone1`

**Proceso**: Calificación → Conversión a Opportunity + Account/Contact

#### Proceso de Calificación (3 Escenarios)

```typescript
// Escenario 1: B2B - Nuevo cliente empresarial
Lead { companyname: "Acme Corp" }
  → Qualify
  → NEW Account ("Acme Corp") + NEW Contact + NEW Opportunity

// Escenario 2: B2B - Cliente empresarial existente
Lead { companyname: "Acme Corp - existing" }
  → Qualify
  → EXISTING Account + NEW/EXISTING Contact + NEW Opportunity

// Escenario 3: B2C - Cliente individual (consumidor)
Lead { companyname: null }
  → Qualify
  → NEW Contact + NEW Opportunity (SIN Account)
```

#### Reglas de Conversión

- ✅ **Opportunity**: SIEMPRE se crea
- ✅ **Contact**: SIEMPRE se crea o vincula uno existente
- ⚠️ **Account**: SOLO si es B2B (puede ser nuevo o existente)
- ✅ Lead cambia a `statecode: Qualified (1)`, NO Inactive

---

### 2. Opportunity (Oportunidad de Venta)

**Propósito**: Posible venta en proceso (pipeline de ventas)

**Estados**: `Open (0)` → `Won (1)` / `Lost (2)`

**Atributos clave**:
- `opportunityid`
- `name`, `estimatedvalue`, `estimatedclosedate`
- `salesstage`, `closeprobability`
- `customerid` (polimórfico: Account o Contact)
- `originatingleadid`

#### Sales Stages

| Sales Stage | Code | Close Probability | Descripción |
|-------------|------|-------------------|-------------|
| Qualify     | 0    | 25%               | Calificación inicial |
| Develop     | 1    | 50%               | Desarrollo de solución |
| Propose     | 2    | 75%               | Propuesta formal |
| Close       | 3    | 100% (Won) / 0% (Lost) | Cierre |

**Detalle de Sales Stages**:
- **Qualify (25%)**: Validar presupuesto, contacto, timeframe, necesidades
- **Develop (50%)**: Identificar stakeholders, desarrollar solución, analizar competidores
- **Propose (75%)**: Presentar propuesta, crear Quote, negociar términos
- **Close (100%/0%)**: Finalizar como Won (genera Order) o Lost (documentar motivo)

---

### 3. Account (Cuenta/Empresa)

**Propósito**: Empresa u organización cliente (B2B)

**Estados**: `Active (0)` / `Inactive (1)`

**Atributos clave**:
- `accountid`
- `name`, `accountnumber`
- `revenue`, `industrycode`
- `address1_*` (dirección completa)
- `parentaccountid` (jerarquía corporativa)

**Relaciones**:
- Tiene múltiples Contacts (1:N)
- Tiene múltiples Opportunities (1:N)
- Puede tener jerarquía con otros Accounts

---

### 4. Contact (Contacto/Persona)

**Propósito**: Persona individual (tomador de decisiones)

**Estados**: `Active (0)` / `Inactive (1)`

**Atributos clave**:
- `contactid`
- `firstname`, `lastname`
- `emailaddress1`, `telephone1`
- `jobtitle`
- `parentcustomerid` (Account - OPCIONAL)

#### Regla B2B vs B2C

```typescript
// B2B: Contact pertenece a Account
Contact {
  parentcustomerid: "account-guid-123"  // REQUIRED en B2B
}

// B2C: Contact independiente
Contact {
  parentcustomerid: null  // Consumidor individual
}
```

**Relaciones**:
- `parentcustomerid`: Account (en escenarios B2B) - OPCIONAL
- Vinculado a Opportunities vía `customerid` (B2C) o como contacto secundario (B2B)

---

### 5. Quote (Cotización)

**Propósito**: Propuesta formal de productos/servicios con precios

**Estados**: `Draft (0)` → `Active (1)` → `Won (2)` / `Lost (3)` / `Canceled (4)`

**Atributos clave**:
- `quoteid`
- `name`, `quotenumber`
- `totalamount`, `totallineitemamount`
- `effectivefrom`, `effectiveto`
- `opportunityid`

**Relaciones**:
- Vinculada a Opportunity (N:1)
- Contiene Quote Lines (1:N)

---

### 6. Order (Pedido)

**Propósito**: Orden de compra confirmada (post-venta ganada)

**Estados**: `Active (0)` → `Submitted (1)` → `Fulfilled (3)` / `Canceled (4)`

**Atributos clave**:
- `salesorderid`
- `name`, `ordernumber`
- `totalamount`
- `quoteid`, `opportunityid`

**Relaciones**:
- Generado desde Quote (N:1)
- Vinculado a Opportunity (N:1)
- Contiene Order Lines (1:N)

---

### 7. Invoice (Factura)

**Propósito**: Facturación del pedido

**Estados**: `Active (0)` → `Paid (2)` / `Canceled (3)`

**Atributos clave**:
- `invoiceid`
- `invoicenumber`
- `totalamount`
- `duedate`
- `salesorderid`

**Relaciones**:
- Generada desde Order (N:1)
- Contiene Invoice Lines (1:N)

---

### 8. Product (Producto/Servicio)

**Propósito**: Catálogo de productos y servicios vendibles

**Estados**: `Active (0)` / `Inactive (1)`

**Atributos clave**:
- `productid`
- `name`, `productnumber`
- `price`
- `defaultuomid`

**Relaciones**:
- Pertenece a Price Lists (N:N)
- Usado en Quote/Order/Invoice Lines

---

### 9. Activity (Actividades)

**Tipos**: Email, PhoneCall, Task, Appointment, Meeting

**Propósito**: Registro de interacciones con clientes

**Atributos clave**:
- `activityid`
- `subject`, `description`
- `scheduledstart`, `actualend`
- `statecode`, `regardingobjectid`

**Relaciones**:
- Vinculada a Lead/Opportunity/Account/Contact (regarding)

---

## ENUMERACIONES CDS

**Ubicación**: `core/contracts/enums/`

### Estados Críticos

- **Lead**: `Open(0)` → `Qualified(1)` / `Disqualified(2)`
- **Opportunity**: `Open(0)` → `Won(1)` / `Lost(2)`
- **Sales Stage**: `Qualify(0/25%)` → `Develop(1/50%)` → `Propose(2/75%)` → `Close(3/100%|0%)`
- **Quote**: `Draft(0)` → `Active(1)` → `Won(2)` / `Closed(3)`
- **Order**: `Active(0)` → `Submitted(1)` → `Fulfilled(3)` / `Canceled(2)`
- **Invoice**: `Active(0)` → `Paid(2)` / `Canceled(3)`

### CustomerType Polimórfico

`'account' | 'contact'`

**Referencia completa**: Ver archivos en `core/contracts/enums/` para todos los enums disponibles.

---

## FLUJOS DE TRABAJO

### 1. Lead Management

```typescript
// features/leads/hooks/use-lead-conversion.ts

interface QualifyLeadOptions {
  // Account options (B2B)
  createAccount: boolean;        // ¿Crear nuevo Account?
  existingAccountId?: string;    // O vincular Account existente

  // Contact options (B2B y B2C)
  createContact: boolean;        // ¿Crear nuevo Contact?
  existingContactId?: string;    // O vincular Contact existente

  // Opportunity details
  opportunityName: string;
  estimatedValue: number;
  estimatedCloseDate: string;
  salesStage: SalesStageCode;
}

async function qualifyLead(leadId: string, options: QualifyLeadOptions) {
  // 1. Validar Lead (debe estar en estado Open)
  // 2. Crear/vincular Account (solo si B2B y createAccount = true)
  // 3. Crear/vincular Contact (siempre)
  // 4. Crear Opportunity vinculada a Customer (Account o Contact)
  // 5. Cambiar Lead.statecode = Qualified (1)
  // 6. Vincular Lead → Opportunity (originatingleadid)
  // 7. Retornar IDs de entidades creadas
}
```

**Reglas**:
- ✅ Todo Lead debe tener `leadsourcecode` (origen)
- ✅ Lead calificado cambia a `statecode: Qualified (1)`, NO Inactive
- ✅ Lead calificado genera: [Account opcional] + Contact + Opportunity
- ✅ Opportunity.customerid apunta a Account (B2B) o Contact (B2C)
- ✅ Opportunity.originatingleadid vincula al Lead original
- ⚠️ Lead descalificado cambia a `statecode: Disqualified (2)`

---

### 2. Opportunity Management

```
1. Crear Opportunity (desde Lead calificado o manual)
2. Mover por Sales Stages: Qualify (25%) → Develop (50%) → Propose (75%) → Close
3. Crear Quote vinculada a Opportunity
4. Activar Quote y cerrar Opportunity como Won
```

**Reglas**:
- ✅ Toda Opportunity debe tener `estimatedvalue` y `estimatedclosedate`
- ✅ `closeprobability` se actualiza automáticamente según `salesstage`
- ✅ Opportunity.customerid puede apuntar a Account (B2B) o Contact (B2C)
- ✅ Opportunity Won con Quote activa → genera Order
- ⚠️ No se puede cerrar como Won sin Quote activa

---

### 3. Quote-to-Cash Process

```
1. Crear Quote desde Opportunity (agregar productos)
2. Activar Quote (cambiar de Draft a Active)
3. Win Opportunity → Quote cambia a Won
4. Generar Order desde Quote (copia Quote Lines → Order Lines)
5. Fulfill Order (marcar como cumplido)
6. Generar Invoice desde Order (copia Order Lines → Invoice Lines)
7. Mark Invoice as Paid
```

**Reglas**:
- ✅ Quote debe tener al menos 1 Quote Line (producto)
- ✅ Quote.totalamount = suma de Quote Lines
- ✅ Order se genera automáticamente desde Quote Won
- ✅ Invoice se genera desde Order Fulfilled
- ⚠️ No se puede editar Quote en estado Active/Won

---

### 4. Account & Contact Management

```
1. Account = Empresa/Organización (B2B)
2. Contact = Persona dentro de Account (B2B) o independiente (B2C)
3. Relación: 1 Account → N Contacts
```

**Reglas**:
- ✅ En B2B: Contact debe vincularse a Account (parentcustomerid)
- ✅ En B2C: Contact independiente (parentcustomerid = null)
- ✅ Account puede tener jerarquía (parentaccountid)
- ✅ Opportunity puede vincularse a Account (B2B) o Contact (B2C) vía customerid

---

### 5. Activity Tracking

```
1. Log Email/PhoneCall/Task/Appointment/Meeting
2. Vincular a Lead/Opportunity/Account/Contact (regarding)
3. Actualizar `actualend` al completar
```

**Reglas**:
- ✅ Toda Activity debe vincularse a un registro
- ✅ Activity con `scheduledstart` en futuro = Scheduled
- ✅ Activity completada cambia a `statecode: Completed (1)`

---

## REFERENCIAS

- **CDS Data Model**: https://docs.microsoft.com/en-us/power-apps/developer/data-platform/
- **Entity Reference**: https://docs.microsoft.com/en-us/dynamics365/sales/developer/entities/
- **Sales Process**: https://docs.microsoft.com/en-us/dynamics365/sales/nurture-sales-from-lead-order-sales
