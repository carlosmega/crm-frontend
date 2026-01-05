# Flujo Lead → Opportunity - Ejemplo Práctico

## Escenario 1: B2B - Nuevo Cliente Empresarial

### Estado Inicial: Lead
```typescript
{
  leadid: "lead-001",
  firstname: "John",
  lastname: "Smith",
  companyname: "Tech Innovations Inc", // ← Indica B2B
  emailaddress1: "john.smith@techinnovations.com",
  telephone1: "+1-555-1234",
  leadsourcecode: LeadSourceCode.Web,
  statecode: LeadStateCode.Open // ← Open (0)
}
```

### Acción: Usuario hace clic en "Qualify Lead"

### Proceso Backend (lo que debe implementarse):

```typescript
async function qualifyLead(leadId: string) {
  const lead = await leadService.getById(leadId)

  // 1. Determinar si es B2B o B2C
  const isB2B = !!lead.companyname

  // 2. Crear Account (solo si es B2B)
  let accountId: string | undefined
  if (isB2B) {
    const newAccount = await accountService.create({
      name: lead.companyname,
      emailaddress1: lead.emailaddress1,
      telephone1: lead.telephone1,
      // ... otros campos del lead
    })
    accountId = newAccount.accountid
  }

  // 3. Crear Contact (SIEMPRE)
  const newContact = await contactService.create({
    firstname: lead.firstname,
    lastname: lead.lastname,
    emailaddress1: lead.emailaddress1,
    telephone1: lead.telephone1,
    parentcustomerid: accountId, // Vincula a Account si es B2B, null si B2C
  })

  // 4. Crear Opportunity
  const newOpportunity = await opportunityService.create({
    name: `${lead.companyname || lead.fullname} - Sales Opportunity`,
    originatingleadid: lead.leadid, // 🔗 VINCULACIÓN CLAVE
    customerid: isB2B ? accountId! : newContact.contactid,
    customeridtype: isB2B ? CustomerType.Account : CustomerType.Contact,
    salesstage: SalesStageCode.Qualify,
    estimatedvalue: 0, // Usuario debe completar
    estimatedclosedate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 días
    ownerid: lead.ownerid,
  })

  // 5. Actualizar Lead a Qualified
  await leadService.update(lead.leadid, {
    statecode: LeadStateCode.Qualified, // ← Cambia a Qualified (1)
  })

  return {
    lead: lead,
    account: accountId ? await accountService.getById(accountId) : null,
    contact: newContact,
    opportunity: newOpportunity,
  }
}
```

### Resultado: Entidades Creadas

**Account creado:**
```typescript
{
  accountid: "acc-001",
  name: "Tech Innovations Inc",
  emailaddress1: "john.smith@techinnovations.com",
  telephone1: "+1-555-1234",
  statecode: AccountStateCode.Active
}
```

**Contact creado:**
```typescript
{
  contactid: "con-001",
  firstname: "John",
  lastname: "Smith",
  fullname: "John Smith",
  emailaddress1: "john.smith@techinnovations.com",
  telephone1: "+1-555-1234",
  parentcustomerid: "acc-001", // ← Vinculado a Account
  statecode: ContactStateCode.Active
}
```

**Opportunity creada:**
```typescript
{
  opportunityid: "opp-001",
  name: "Tech Innovations Inc - Sales Opportunity",
  originatingleadid: "lead-001", // 🔗 VINCULADO AL LEAD ORIGINAL
  customerid: "acc-001", // ← Apunta al Account
  customeridtype: CustomerType.Account, // ← Indica que es Account
  salesstage: SalesStageCode.Qualify,
  closeprobability: 25,
  estimatedvalue: 0,
  statecode: OpportunityStateCode.Open
}
```

**Lead actualizado:**
```typescript
{
  leadid: "lead-001",
  firstname: "John",
  lastname: "Smith",
  companyname: "Tech Innovations Inc",
  statecode: LeadStateCode.Qualified, // ← CAMBIÓ de Open (0) a Qualified (1)
  // ... resto de campos sin cambios
}
```

---

## Escenario 2: B2C - Cliente Individual

### Estado Inicial: Lead
```typescript
{
  leadid: "lead-002",
  firstname: "Mary",
  lastname: "Johnson",
  companyname: null, // ← Sin company = B2C
  emailaddress1: "mary.johnson@email.com",
  telephone1: "+1-555-5678",
  statecode: LeadStateCode.Open
}
```

### Resultado: Solo Contact + Opportunity (sin Account)

**Contact creado:**
```typescript
{
  contactid: "con-002",
  firstname: "Mary",
  lastname: "Johnson",
  parentcustomerid: undefined, // ← Sin Account (B2C)
  statecode: ContactStateCode.Active
}
```

**Opportunity creada:**
```typescript
{
  opportunityid: "opp-002",
  name: "Mary Johnson - Sales Opportunity",
  originatingleadid: "lead-002", // 🔗 VINCULADO AL LEAD
  customerid: "con-002", // ← Apunta directamente al Contact
  customeridtype: CustomerType.Contact, // ← Indica que es Contact
  salesstage: SalesStageCode.Qualify,
  statecode: OpportunityStateCode.Open
}
```

---

## Cómo Visualizar la Relación en la UI

### Vista de Lead (después de calificar):
```
┌─────────────────────────────────────────────┐
│ Lead: John Smith - Tech Innovations Inc     │
│ Status: ✅ Qualified                        │
│                                             │
│ 📊 Related Opportunity:                     │
│ → Tech Innovations Inc - Sales Opportunity  │
│    (Click to view)                          │
└─────────────────────────────────────────────┘
```

### Vista de Opportunity:
```
┌─────────────────────────────────────────────┐
│ Tech Innovations Inc - Sales Opportunity    │
│                                             │
│ 🔗 Originated from Lead:                    │
│ → John Smith - Tech Innovations Inc         │
│    (Click to view original lead)            │
│                                             │
│ 👤 Customer: Tech Innovations Inc (Account) │
│ 📞 Primary Contact: John Smith              │
└─────────────────────────────────────────────┘
```

---

## Query para obtener Opportunity desde Lead

```typescript
// En el detalle de Lead, mostrar la Opportunity generada
async function getOpportunityFromLead(leadId: string) {
  const opportunities = await opportunityService.getAll()
  return opportunities.filter(opp => opp.originatingleadid === leadId)
}

// En el detalle de Opportunity, mostrar el Lead original
async function getLeadFromOpportunity(opportunityId: string) {
  const opportunity = await opportunityService.getById(opportunityId)
  if (opportunity?.originatingleadid) {
    return await leadService.getById(opportunity.originatingleadid)
  }
  return null
}
```

---

## Estados del Lead

| Estado | Code | Descripción |
|--------|------|-------------|
| **Open** | 0 | Lead activo, en proceso de calificación |
| **Qualified** | 1 | Lead calificado → Opportunity creada (NO SE ELIMINA) |
| **Disqualified** | 2 | Lead descalificado, no procede |

⚠️ **IMPORTANTE**: Cuando un Lead se califica:
- El Lead NO se elimina
- El Lead cambia a estado `Qualified (1)`
- Se mantiene como registro histórico
- Se puede consultar para ver el origen de la Opportunity

---

## Resumen de Campos Clave

| Entidad | Campo | Propósito |
|---------|-------|-----------|
| Lead | `statecode` | Indica si está Open/Qualified/Disqualified |
| Opportunity | `originatingleadid` | ID del Lead que generó esta Opportunity |
| Opportunity | `customerid` | ID del Account (B2B) o Contact (B2C) |
| Opportunity | `customeridtype` | Tipo de customer: 'account' o 'contact' |
| Contact | `parentcustomerid` | ID del Account (B2B) o null (B2C) |
