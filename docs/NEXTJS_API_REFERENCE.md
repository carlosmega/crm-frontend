# Next.js CRM API Reference - Common Data Service

Guía práctica para consumir el backend CRM Django desde Next.js siguiendo el modelo Common Data Service (Microsoft Dynamics 365).

---

## 📋 Tabla de Contenidos

1. [Setup Rápido](#setup-rápido)
2. [Autenticación](#autenticación)
3. [Leads - Pipeline de Clientes Potenciales](#leads)
4. [Opportunities - Oportunidades de Venta](#opportunities)
5. [Accounts - Empresas (B2B)](#accounts)
6. [Contacts - Contactos (B2C)](#contacts)
7. [Quotes - Cotizaciones](#quotes)
8. [Orders - Órdenes de Venta](#orders)
9. [Invoices - Facturas](#invoices)
10. [Users - Gestión de Usuarios](#users)

---

## Setup Rápido

### 1. Instalar dependencias

```bash
npm install axios
```


### 2. Configurar .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Cliente API Base

**Archivo**: `src/lib/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Importante para cookies de sesión
});

// Agregar CSRF token automáticamente
api.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

export default api;
```

---

## Autenticación

### Endpoints de Auth

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/me` | Usuario actual |
| POST | `/auth/change-password` | Cambiar contraseña |

### Código Listo para Usar

```typescript
// src/services/auth.ts
import api from '@/lib/api';

export const authService = {
  // Login
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', {
      emailaddress1: email,
      password: password
    });
    return data; // { user: {...}, message: "..." }
  },

  // Logout
  logout: async () => {
    await api.post('/auth/logout');
  },

  // Usuario actual
  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Cambiar contraseña
  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }
};
```

### Ejemplo de Login Component

```typescript
'use client';
import { useState } from 'react';
import { authService } from '@/services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');

  const handleLogin = async () => {
    try {
      const response = await authService.login(email, password);
      console.log('Logged in:', response.user);
      // Redirigir a dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

---

## Leads

**Pipeline**: Lead → Qualify → Opportunity + Account + Contact

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/leads/` | Listar leads |
| POST | `/leads/` | Crear lead |
| GET | `/leads/{id}` | Obtener lead |
| PATCH | `/leads/{id}` | Actualizar lead |
| DELETE | `/leads/{id}` | Eliminar lead |
| POST | `/leads/{id}/qualify` | Calificar lead |
| POST | `/leads/{id}/disqualify` | Descalificar lead |
| GET | `/leads/stats` | Estadísticas |

### Estados de Lead (CDS)

```typescript
enum LeadStateCode {
  OPEN = 0,        // Abierto
  QUALIFIED = 1,   // Calificado
  DISQUALIFIED = 2 // Descalificado
}

enum LeadStatusCode {
  NEW = 1,           // Nuevo
  CONTACTED = 2,     // Contactado
  QUALIFIED = 3,     // Calificado
  LOST = 4,          // Perdido
  CANNOT_CONTACT = 5,// No se puede contactar
  NO_LONGER_INTERESTED = 6 // Ya no interesado
}
```

### Código Listo para Usar

```typescript
// src/services/leads.ts
import api from '@/lib/api';

export const leadsService = {
  // Listar leads
  list: async (filters?: { statecode?: number; search?: string }) => {
    const { data } = await api.get('/leads/', { params: filters });
    return data;
  },

  // Obtener lead por ID
  getById: async (leadId: string) => {
    const { data } = await api.get(`/leads/${leadId}`);
    return data;
  },

  // Crear lead
  create: async (lead: {
    lastname: string;
    emailaddress1: string;
    companyname: string;
    subject: string;
    firstname?: string;
    telephone1?: string;
    jobtitle?: string;
    leadqualitycode?: number; // 1=Cold, 2=Warm, 3=Hot
    estimatedvalue?: string;
  }) => {
    const { data } = await api.post('/leads/', lead);
    return data;
  },

  // Actualizar lead
  update: async (leadId: string, updates: any) => {
    const { data } = await api.patch(`/leads/${leadId}`, updates);
    return data;
  },

  // Calificar lead (Crea Opportunity + Account + Contact)
  qualify: async (leadId: string, options: {
    create_account: boolean;
    create_contact: boolean;
    opportunity_name?: string;
  }) => {
    const { data } = await api.post(`/leads/${leadId}/qualify`, options);
    return data;
  },

  // Eliminar lead
  delete: async (leadId: string) => {
    await api.delete(`/leads/${leadId}`);
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/leads/stats');
    return data;
  }
};
```

### Ejemplo de Componente

```typescript
'use client';
import { useEffect, useState } from 'react';
import { leadsService } from '@/services/leads';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const data = await leadsService.list({ statecode: 0 }); // Solo abiertos
    setLeads(data);
  };

  const handleQualify = async (leadId: string) => {
    await leadsService.qualify(leadId, {
      create_account: true,
      create_contact: true
    });
    loadLeads(); // Recargar
  };

  return (
    <div>
      <h1>Leads</h1>
      {leads.map(lead => (
        <div key={lead.leadid}>
          <h3>{lead.firstname} {lead.lastname} - {lead.companyname}</h3>
          <p>{lead.emailaddress1}</p>
          <button onClick={() => handleQualify(lead.leadid)}>
            Calificar
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Opportunities

**Pipeline**: Open → Develop → Propose → Close (Win/Loss)

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/opportunities/` | Listar oportunidades |
| POST | `/opportunities/` | Crear oportunidad |
| GET | `/opportunities/{id}` | Obtener oportunidad |
| PATCH | `/opportunities/{id}` | Actualizar oportunidad |
| DELETE | `/opportunities/{id}` | Eliminar oportunidad |
| POST | `/opportunities/{id}/close` | Cerrar (win/loss) |
| GET | `/opportunities/stats` | Estadísticas |

### Estados de Opportunity (CDS)

```typescript
enum OpportunityStateCode {
  OPEN = 0,   // Abierta
  WON = 1,    // Ganada
  LOST = 2    // Perdida
}

enum OpportunityStatusCode {
  IN_PROGRESS = 1, // En progreso
  ON_HOLD = 2,     // En espera
  WON = 3,         // Ganada
  CANCELED = 4,    // Cancelada
  OUT_SOLD = 5     // Perdida ante competencia
}

enum SalesStage {
  QUALIFY = 0,  // Calificar
  DEVELOP = 1,  // Desarrollar
  PROPOSE = 2,  // Proponer
  CLOSE = 3     // Cerrar
}
```

### Código Listo para Usar

```typescript
// src/services/opportunities.ts
import api from '@/lib/api';

export const opportunitiesService = {
  // Listar oportunidades
  list: async (filters?: { statecode?: number; salesstage?: number }) => {
    const { data } = await api.get('/opportunities/', { params: filters });
    return data;
  },

  // Crear oportunidad
  create: async (opportunity: {
    name: string;
    customername: string;
    estimatedrevenue?: string;
    estimatedclosedate?: string;
    salesstage?: number;
    probability?: number;
  }) => {
    const { data } = await api.post('/opportunities/', opportunity);
    return data;
  },

  // Actualizar oportunidad
  update: async (opportunityId: string, updates: any) => {
    const { data } = await api.patch(`/opportunities/${opportunityId}`, updates);
    return data;
  },

  // Cerrar oportunidad
  close: async (opportunityId: string, options: {
    status: 3 | 4 | 5; // 3=Won, 4=Canceled, 5=Out-Sold
    actualrevenue?: string;
    actualclosedate?: string;
    closingnotes?: string;
  }) => {
    const { data } = await api.post(`/opportunities/${opportunityId}/close`, options);
    return data;
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/opportunities/stats');
    return data;
  }
};
```

### Ejemplo de Componente

```typescript
'use client';
import { opportunitiesService } from '@/services/opportunities';

export default function OpportunitiesPage() {
  const handleWin = async (oppId: string) => {
    await opportunitiesService.close(oppId, {
      status: 3,
      actualrevenue: '50000.00',
      actualclosedate: new Date().toISOString().split('T')[0],
      closingnotes: 'Cliente firmó contrato'
    });
  };

  // ... resto del componente
}
```

---

## Accounts

**Empresas B2B** - Cuentas corporativas

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/accounts/` | Listar empresas |
| POST | `/accounts/` | Crear empresa |
| GET | `/accounts/{id}` | Obtener empresa |
| PATCH | `/accounts/{id}` | Actualizar empresa |
| DELETE | `/accounts/{id}` | Eliminar empresa |

### Código Listo para Usar

```typescript
// src/services/accounts.ts
import api from '@/lib/api';

export const accountsService = {
  // Listar empresas
  list: async (filters?: { search?: string; statecode?: number }) => {
    const { data } = await api.get('/accounts/', { params: filters });
    return data;
  },

  // Crear empresa
  create: async (account: {
    name: string;
    accountnumber?: string;
    emailaddress1?: string;
    telephone1?: string;
    websiteurl?: string;
    address1_line1?: string;
    address1_city?: string;
    address1_stateorprovince?: string;
    address1_postalcode?: string;
    address1_country?: string;
    revenue?: string;
    numberofemployees?: number;
  }) => {
    const { data } = await api.post('/accounts/', account);
    return data;
  },

  // Actualizar empresa
  update: async (accountId: string, updates: any) => {
    const { data } = await api.patch(`/accounts/${accountId}`, updates);
    return data;
  }
};
```

---

## Contacts

**Contactos B2C** - Personas individuales

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/contacts/` | Listar contactos |
| POST | `/contacts/` | Crear contacto |
| GET | `/contacts/{id}` | Obtener contacto |
| PATCH | `/contacts/{id}` | Actualizar contacto |
| DELETE | `/contacts/{id}` | Eliminar contacto |

### Código Listo para Usar

```typescript
// src/services/contacts.ts
import api from '@/lib/api';

export const contactsService = {
  // Listar contactos
  list: async (filters?: { parentcustomerid?: string; search?: string }) => {
    const { data } = await api.get('/contacts/', { params: filters });
    return data;
  },

  // Crear contacto
  create: async (contact: {
    firstname: string;
    lastname: string;
    emailaddress1?: string;
    telephone1?: string;
    mobilephone?: string;
    jobtitle?: string;
    parentcustomerid?: string; // ID de Account (empresa)
    address1_city?: string;
  }) => {
    const { data } = await api.post('/contacts/', contact);
    return data;
  },

  // Actualizar contacto
  update: async (contactId: string, updates: any) => {
    const { data } = await api.patch(`/contacts/${contactId}`, updates);
    return data;
  }
};
```

---

## Quotes

**Cotizaciones** - Propuestas de precio con line items

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/quotes/` | Listar cotizaciones |
| POST | `/quotes/` | Crear cotización |
| POST | `/quotes/from-opportunity/{id}` | Crear desde opportunity |
| GET | `/quotes/{id}` | Obtener cotización |
| PATCH | `/quotes/{id}` | Actualizar cotización |
| DELETE | `/quotes/{id}` | Eliminar cotización |
| POST | `/quotes/{id}/details` | Agregar producto |
| DELETE | `/quotes/details/{id}` | Eliminar producto |
| POST | `/quotes/{id}/activate` | Activar cotización |
| POST | `/quotes/{id}/close` | Cerrar (won/lost) |
| GET | `/quotes/stats/summary` | Estadísticas |

### Estados de Quote (CDS)

```typescript
enum QuoteStateCode {
  DRAFT = 0,   // Borrador
  ACTIVE = 1,  // Activa
  WON = 2,     // Ganada
  CLOSED = 3   // Cerrada
}
```

### Código Listo para Usar

```typescript
// src/services/quotes.ts
import api from '@/lib/api';

export const quotesService = {
  // Listar cotizaciones
  list: async (filters?: { statecode?: number }) => {
    const { data } = await api.get('/quotes/', { params: filters });
    return data;
  },

  // Crear cotización desde opportunity
  createFromOpportunity: async (opportunityId: string) => {
    const { data } = await api.post(`/quotes/from-opportunity/${opportunityId}`);
    return data;
  },

  // Agregar producto a cotización
  addLineItem: async (quoteId: string, item: {
    productname: string;
    productdescription?: string;
    quantity: string;
    priceperunit: string;
    tax?: string;
    manualdiscountamount?: string;
  }) => {
    const { data } = await api.post(`/quotes/${quoteId}/details`, item);
    return data;
  },

  // Activar cotización (Draft → Active)
  activate: async (quoteId: string, dates: {
    effectivefrom: string;
    effectiveto: string;
  }) => {
    const { data } = await api.post(`/quotes/${quoteId}/activate`, dates);
    return data;
  },

  // Cerrar cotización como ganada
  closeAsWon: async (quoteId: string) => {
    const { data } = await api.post(`/quotes/${quoteId}/close`, {
      statuscode: 3, // Won
      closedon: new Date().toISOString().split('T')[0]
    });
    return data;
  }
};
```

### Ejemplo - Flujo Completo de Cotización

```typescript
'use client';
import { quotesService } from '@/services/quotes';

export default function QuotePage() {
  const createQuoteWorkflow = async (opportunityId: string) => {
    // 1. Crear cotización desde opportunity
    const quote = await quotesService.createFromOpportunity(opportunityId);

    // 2. Agregar productos
    await quotesService.addLineItem(quote.quoteid, {
      productname: 'Licencia Office 365',
      quantity: '100',
      priceperunit: '250.00',
      tax: '4000.00'
    });

    // 3. Activar cotización
    await quotesService.activate(quote.quoteid, {
      effectivefrom: '2024-01-01',
      effectiveto: '2024-03-31'
    });

    // 4. Cerrar como ganada
    await quotesService.closeAsWon(quote.quoteid);

    return quote;
  };

  // ... resto del componente
}
```

---

## Orders

**Órdenes de Venta** - Contratos confirmados

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/orders/` | Listar órdenes |
| POST | `/orders/` | Crear orden |
| POST | `/orders/from-quote/{id}` | Crear desde quote |
| GET | `/orders/{id}` | Obtener orden |
| PATCH | `/orders/{id}` | Actualizar orden |
| POST | `/orders/{id}/submit` | Enviar orden |
| POST | `/orders/{id}/fulfill` | Marcar como entregada |
| POST | `/orders/{id}/cancel` | Cancelar orden |
| GET | `/orders/stats/summary` | Estadísticas |

### Estados de Order (CDS)

```typescript
enum OrderStateCode {
  ACTIVE = 0,     // Activa
  SUBMITTED = 1,  // Enviada
  CANCELED = 2,   // Cancelada
  FULFILLED = 3,  // Entregada
  INVOICED = 4    // Facturada
}
```

### Código Listo para Usar

```typescript
// src/services/orders.ts
import api from '@/lib/api';

export const ordersService = {
  // Listar órdenes
  list: async (filters?: { statecode?: number }) => {
    const { data } = await api.get('/orders/', { params: filters });
    return data;
  },

  // Crear orden desde quote ganada
  createFromQuote: async (quoteId: string) => {
    const { data } = await api.post(`/orders/from-quote/${quoteId}`);
    return data;
  },

  // Enviar orden (Active → Submitted)
  submit: async (orderId: string) => {
    const { data } = await api.post(`/orders/${orderId}/submit`);
    return data;
  },

  // Marcar como entregada (Submitted → Fulfilled)
  fulfill: async (orderId: string, datefulfilled?: string) => {
    const { data } = await api.post(`/orders/${orderId}/fulfill`, {
      datefulfilled: datefulfilled || new Date().toISOString().split('T')[0]
    });
    return data;
  },

  // Cancelar orden
  cancel: async (orderId: string) => {
    const { data } = await api.post(`/orders/${orderId}/cancel`);
    return data;
  }
};
```

---

## Invoices

**Facturas** - Documentos de cobro con pagos

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/invoices/` | Listar facturas |
| POST | `/invoices/` | Crear factura |
| POST | `/invoices/from-order/{id}` | Crear desde order |
| GET | `/invoices/{id}` | Obtener factura |
| PATCH | `/invoices/{id}` | Actualizar factura |
| POST | `/invoices/{id}/details` | Agregar producto |
| DELETE | `/invoices/{id}/details/{detail_id}` | Eliminar producto |
| POST | `/invoices/{id}/record-payment` | Registrar pago |
| POST | `/invoices/{id}/cancel` | Cancelar factura |
| GET | `/invoices/stats/summary` | Estadísticas |

### Estados de Invoice (CDS)

```typescript
enum InvoiceStateCode {
  ACTIVE = 0,   // Activa
  PAID = 1,     // Pagada
  CANCELED = 2  // Cancelada
}
```

### Código Listo para Usar

```typescript
// src/services/invoices.ts
import api from '@/lib/api';

export const invoicesService = {
  // Listar facturas
  list: async (filters?: { statecode?: number; overdue?: boolean }) => {
    const { data } = await api.get('/invoices/', { params: filters });
    return data;
  },

  // Crear factura desde orden entregada
  createFromOrder: async (orderId: string) => {
    const { data } = await api.post(`/invoices/from-order/${orderId}`);
    return data;
  },

  // Registrar pago (parcial o total)
  recordPayment: async (invoiceId: string, payment: {
    payment_amount: string;
    payment_date: string;
  }) => {
    const { data } = await api.post(`/invoices/${invoiceId}/record-payment`, payment);
    return data;
  },

  // Cancelar factura
  cancel: async (invoiceId: string, reason?: string) => {
    const { data } = await api.post(`/invoices/${invoiceId}/cancel`, { reason });
    return data;
  },

  // Estadísticas
  getStats: async () => {
    const { data } = await api.get('/invoices/stats/summary');
    return data; // { total_invoices, total_amount, total_paid, total_due, overdue_count }
  }
};
```

### Ejemplo - Registrar Pagos

```typescript
'use client';
import { invoicesService } from '@/services/invoices';

export default function InvoicePage() {
  const handlePayment = async (invoiceId: string, amount: string) => {
    // Pago parcial
    await invoicesService.recordPayment(invoiceId, {
      payment_amount: amount,
      payment_date: new Date().toISOString().split('T')[0]
    });

    // La factura se marca automáticamente como PAID cuando:
    // totalamountdue === 0
  };

  // ... resto del componente
}
```

---

## Users

**Gestión de Usuarios y Roles**

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users/` | Listar usuarios |
| POST | `/users/` | Crear usuario (Admin) |
| GET | `/users/{id}` | Obtener usuario |
| PATCH | `/users/{id}` | Actualizar usuario |
| DELETE | `/users/{id}` | Desactivar usuario |
| GET | `/roles/` | Listar roles |

### Roles RBAC (CDS)

```typescript
enum SecurityRole {
  SYSTEM_ADMINISTRATOR = 'System Administrator',
  SALES_MANAGER = 'Sales Manager',
  SALESPERSON = 'Salesperson',
  MARKETING_USER = 'Marketing User',
  READ_ONLY_USER = 'Read-Only User'
}
```

### Código Listo para Usar

```typescript
// src/services/users.ts
import api from '@/lib/api';

export const usersService = {
  // Listar usuarios
  list: async (filters?: { role?: string; isdisabled?: boolean }) => {
    const { data } = await api.get('/users/', { params: filters });
    return data;
  },

  // Crear usuario (solo Admin)
  create: async (user: {
    emailaddress1: string;
    fullname: string;
    password: string;
    role_name: string;
  }) => {
    const { data } = await api.post('/users/', user);
    return data;
  },

  // Listar roles disponibles
  getRoles: async () => {
    const { data } = await api.get('/roles/');
    return data;
  }
};
```

---

## 🔥 Flujo Completo - Lead a Invoice

```typescript
// src/workflows/salesPipeline.ts
import { leadsService } from '@/services/leads';
import { opportunitiesService } from '@/services/opportunities';
import { quotesService } from '@/services/quotes';
import { ordersService } from '@/services/orders';
import { invoicesService } from '@/services/invoices';

export async function completeSalesPipeline(leadId: string) {
  // 1. Calificar Lead → Crea Opportunity + Account + Contact
  const lead = await leadsService.qualify(leadId, {
    create_account: true,
    create_contact: true
  });

  const opportunityId = lead.qualifyingopportunityid;

  // 2. Cerrar Opportunity como ganada
  await opportunitiesService.close(opportunityId, {
    status: 3,
    actualrevenue: '50000.00',
    actualclosedate: new Date().toISOString().split('T')[0]
  });

  // 3. Crear Quote desde Opportunity
  const quote = await quotesService.createFromOpportunity(opportunityId);

  // 4. Agregar productos a Quote
  await quotesService.addLineItem(quote.quoteid, {
    productname: 'CRM Enterprise License',
    quantity: '100',
    priceperunit: '500.00',
    tax: '8000.00'
  });

  // 5. Activar Quote
  await quotesService.activate(quote.quoteid, {
    effectivefrom: '2024-01-01',
    effectiveto: '2024-03-31'
  });

  // 6. Cerrar Quote como ganada
  await quotesService.closeAsWon(quote.quoteid);

  // 7. Crear Order desde Quote
  const order = await ordersService.createFromQuote(quote.quoteid);

  // 8. Enviar Order
  await ordersService.submit(order.salesorderid);

  // 9. Marcar Order como entregada
  await ordersService.fulfill(order.salesorderid);

  // 10. Crear Invoice desde Order
  const invoice = await invoicesService.createFromOrder(order.salesorderid);

  // 11. Registrar pago
  await invoicesService.recordPayment(invoice.invoiceid, {
    payment_amount: '50000.00',
    payment_date: new Date().toISOString().split('T')[0]
  });

  return {
    lead,
    opportunity: opportunityId,
    quote,
    order,
    invoice
  };
}
```

---

## 📊 Resumen de Endpoints por Entidad

| Entidad | Total Endpoints | CRUD | Especiales |
|---------|----------------|------|------------|
| Auth | 4 | - | login, logout, me, change-password |
| Leads | 8 | 5 | qualify, disqualify, stats |
| Opportunities | 7 | 5 | close, stats |
| Accounts | 5 | 5 | - |
| Contacts | 5 | 5 | - |
| Quotes | 12 | 5 | from-opportunity, details, activate, close, stats |
| Orders | 10 | 5 | from-quote, submit, fulfill, cancel, stats |
| Invoices | 11 | 5 | from-order, details, record-payment, cancel, stats |
| Users | 6 | 5 | roles |

**Total: 68+ endpoints**

---

## 🎯 Quick Start Templates

### Template 1: Página de Lista

```typescript
'use client';
import { useEffect, useState } from 'react';
import { leadsService } from '@/services/leads';

export default function EntityListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await leadsService.list();
      setItems(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Leads</h1>
      {items.map(item => (
        <div key={item.leadid}>
          {item.firstname} {item.lastname}
        </div>
      ))}
    </div>
  );
}
```

### Template 2: Formulario de Creación

```typescript
'use client';
import { useState } from 'react';
import { leadsService } from '@/services/leads';

export default function CreateEntityPage() {
  const [formData, setFormData] = useState({
    lastname: '',
    emailaddress1: '',
    companyname: '',
    subject: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leadsService.create(formData);
      // Redirigir o mostrar mensaje
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.lastname}
        onChange={e => setFormData({...formData, lastname: e.target.value})}
        placeholder="Apellido"
      />
      {/* Más campos... */}
      <button type="submit">Crear</button>
    </form>
  );
}
```

---

## ✅ Checklist de Implementación

- [ ] Instalar axios
- [ ] Crear `src/lib/api.ts`
- [ ] Crear servicios en `src/services/`
- [ ] Implementar página de login
- [ ] Implementar páginas CRUD para cada entidad
- [ ] Probar flujo completo Lead → Invoice

---

**Backend URL**: `http://localhost:8000/api`
**Frontend URL**: `http://localhost:3000`

**Usuario de prueba**:
- Email: `admin@test.com`
- Password: `admin123`
