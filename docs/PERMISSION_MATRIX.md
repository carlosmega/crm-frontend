# Permission Matrix - Visual Reference
> Matriz visual de permisos por rol y entidad

---

## 📊 Current Permission Matrix

### Legend
- ✅ = Permitido
- ❌ = Denegado
- 🔒 = Solo propios (User level)
- 👥 = Team level
- 🌐 = Organization level

---

## 🔐 LEADS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Delete    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 💼 OPPORTUNITIES

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Delete    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 🏢 ACCOUNTS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Delete    | ✅ 🌐 | ✅ 🔒          | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 👤 CONTACTS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Delete    | ✅ 🌐 | ✅ 🔒          | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ✅ 👥     |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 📋 QUOTES

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Delete    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 📦 ORDERS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ❌        |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ❌        |
| Delete    | ✅ 🌐 | ✅ 🔒          | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 💰 INVOICES

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ❌        |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Delete    | ✅ 🌐 | ✅ 🔒          | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Share     | ✅ 🌐 | ✅ 👥          | ❌        | ❌               | ❌        |

---

## 📦 PRODUCTS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 🌐         | ✅ 🌐     | ❌               | ❌        |
| Update    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Delete    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 🌐         | ❌        | ❌               | ❌        |
| Share     | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |

**Note**: Products son Organization-level read para todos los roles de ventas (catálogo compartido)

---

## 📅 ACTIVITIES

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Read      | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Update    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ✅ 🔒            | ✅ 👥     |
| Delete    | ✅ 🌐 | ✅ 👥          | ✅ 🔒     | ❌               | ❌        |
| Export    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Share     | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |

---

## 👥 SYSTEM USERS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Create    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Read      | ✅ 🌐 | ✅ 👥         | ❌        | ❌               | ❌        |
| Update    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |
| Delete    | ✅ 🌐 | ❌            | ❌        | ❌               | ❌        |

**Note**: Solo Admin puede gestionar usuarios

---

## 📊 AUDIT LOGS

| Operation | Admin | Sales Manager | Sales Rep | Customer Service | Marketing |
|-----------|-------|---------------|-----------|------------------|-----------|
| Read      | ✅ 🌐 | ✅ 👥         | ❌        | ❌               | ❌        |
| Export    | ✅ 🌐 | ✅ 👥         | ❌        | ❌               | ❌        |

**Note**: Solo lectura y export, no se pueden modificar logs

---

## 🎯 Role Summaries

### 🔴 System Administrator
- **Access**: Organization-level en TODAS las entidades
- **Can**: Todo (CRUD + Share + Export)
- **Use Case**: IT, CEO, System Admins

### 🔵 Sales Manager
- **Access**: Team-level en entidades de ventas
- **Can**: CRUD + Share + Export para su equipo
- **Cannot**: Gestionar usuarios (solo leer team)
- **Use Case**: Gerente de Ventas, Team Leader

### 🟢 Sales Representative
- **Access**: User-level (solo sus registros)
- **Can**: CRUD en sus propios leads, opportunities, quotes, orders, invoices
- **Cannot**: Delete Accounts/Contacts, Share records, Gestionar productos
- **Use Case**: Vendedor, Account Executive

### 🟡 Customer Service Rep
- **Access**: User-level (soporte)
- **Can**: Read/Update orders, invoices, contacts
- **Cannot**: Ver leads/opportunities, Crear/eliminar
- **Use Case**: Soporte al Cliente, Account Manager

### 🟣 Marketing Professional
- **Access**: Team-level en leads/contacts
- **Can**: Gestionar leads, contacts, activities (campañas)
- **Cannot**: Ver opportunities, quotes, orders, invoices
- **Use Case**: Marketing Manager, Campaign Specialist

---

## 📝 Quick Modification Examples

### Permitir que Sales Rep pueda Delete Accounts
```typescript
// src/core/contracts/security/permissions.ts
[UserRole.SalesRepresentative]: [
  // ... otros permisos
  { entity: PermissionEntity.Account, operation: Permission.Delete, accessLevel: AccessLevel.User },
]
```

### Dar acceso Organization-level a Sales Manager en Products
```typescript
[UserRole.SalesManager]: [
  // ... otros permisos
  { entity: PermissionEntity.Product, operation: Permission.Create, accessLevel: AccessLevel.Organization },
  { entity: PermissionEntity.Product, operation: Permission.Update, accessLevel: AccessLevel.Organization },
]
```

### Remover permiso de Export para Marketing
```typescript
[UserRole.MarketingProfessional]: [
  // ... otros permisos
  // Comentar o eliminar estas líneas:
  // { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.Team },
  // { entity: PermissionEntity.Contact, operation: Permission.Export, accessLevel: AccessLevel.Team },
]
```

---

## 🔍 Where to Find This in Code

**File**: `src/core/contracts/security/permissions.ts`

**Lines**:
- System Administrator: 50-120
- Sales Manager: 123-200
- Sales Representative: 203-260
- Customer Service Rep: 263-285
- Marketing Professional: 288-315

---

**Last Updated**: 2025-01-15
**Source**: permissions.ts (ROLE_PERMISSIONS constant)
