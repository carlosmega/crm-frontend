# Security Configuration Guide
> Guía completa para configurar roles, permisos y seguridad en el CRM

---

## 🎯 Quick Start - Escenarios Comunes

### Escenario 1: Agregar un Nuevo Rol

**Paso 1**: Definir el rol en `src/core/contracts/entities/system-user.ts`

```typescript
export enum UserRole {
  SystemAdministrator = 'system-administrator',
  SalesManager = 'sales-manager',
  SalesRepresentative = 'sales-representative',
  CustomerServiceRep = 'customer-service-rep',
  MarketingProfessional = 'marketing-professional',

  // 👇 NUEVO ROL
  FinanceManager = 'finance-manager',
}
```

**Paso 2**: Agregar display name en la misma archivo (línea 121-130)

```typescript
export function getUserRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SystemAdministrator]: 'System Administrator',
    [UserRole.SalesManager]: 'Sales Manager',
    [UserRole.SalesRepresentative]: 'Sales Representative',
    [UserRole.CustomerServiceRep]: 'Customer Service Rep',
    [UserRole.MarketingProfessional]: 'Marketing Professional',

    // 👇 NUEVO DISPLAY NAME
    [UserRole.FinanceManager]: 'Finance Manager',
  }
  return roleNames[role]
}
```

**Paso 3**: Definir permisos en `src/core/contracts/security/permissions.ts`

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, PermissionRule[]> = {
  // ... otros roles

  // 👇 NUEVO ROL CON SUS PERMISOS
  [UserRole.FinanceManager]: [
    // Puede ver todas las invoices
    { entity: PermissionEntity.Invoice, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Invoice, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    // Puede ver orders
    { entity: PermissionEntity.Order, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Order, operation: Permission.Export, accessLevel: AccessLevel.Organization },

    // Puede ver quotes (solo lectura)
    { entity: PermissionEntity.Quote, operation: Permission.Read, accessLevel: AccessLevel.Organization },

    // Puede ver accounts y contacts
    { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Contact, operation: Permission.Read, accessLevel: AccessLevel.Organization },

    // No puede ver leads ni opportunities (seguridad)
  ],
}
```

---

### Escenario 2: Modificar Permisos de un Rol Existente

**Ejemplo**: Permitir que Sales Representative pueda eliminar sus propios Leads

**Archivo**: `src/core/contracts/security/permissions.ts`

```typescript
[UserRole.SalesRepresentative]: [
  // Permisos existentes de Leads
  { entity: PermissionEntity.Lead, operation: Permission.Create, accessLevel: AccessLevel.User },
  { entity: PermissionEntity.Lead, operation: Permission.Read, accessLevel: AccessLevel.User },
  { entity: PermissionEntity.Lead, operation: Permission.Update, accessLevel: AccessLevel.User },

  // 👇 AGREGAR ESTA LÍNEA
  { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.User },

  { entity: PermissionEntity.Lead, operation: Permission.Export, accessLevel: AccessLevel.User },
  // ... resto de permisos
],
```

**Ejemplo 2**: Dar acceso Team-level a SalesRepresentative en Accounts

```typescript
[UserRole.SalesRepresentative]: [
  // ... otros permisos

  // 👇 CAMBIAR DE User → Team
  { entity: PermissionEntity.Account, operation: Permission.Read, accessLevel: AccessLevel.Team }, // Antes: User

  // ... resto de permisos
],
```

---

### Escenario 3: Agregar una Nueva Entidad Protegida

**Ejemplo**: Agregar permisos para una entidad "Campaign"

**Paso 1**: Agregar entidad en `src/core/contracts/security/permissions.ts`

```typescript
export enum PermissionEntity {
  Lead = 'lead',
  Opportunity = 'opportunity',
  Account = 'account',
  Contact = 'contact',
  // ... otras entidades

  // 👇 NUEVA ENTIDAD
  Campaign = 'campaign',
}
```

**Paso 2**: Agregar permisos por rol

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, PermissionRule[]> = {
  [UserRole.SystemAdministrator]: [
    // ... permisos existentes

    // 👇 AGREGAR PERMISOS PARA CAMPAIGN
    { entity: PermissionEntity.Campaign, operation: Permission.Create, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Campaign, operation: Permission.Read, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Campaign, operation: Permission.Update, accessLevel: AccessLevel.Organization },
    { entity: PermissionEntity.Campaign, operation: Permission.Delete, accessLevel: AccessLevel.Organization },
  ],

  [UserRole.MarketingProfessional]: [
    // ... permisos existentes

    // 👇 Marketing puede gestionar campaigns
    { entity: PermissionEntity.Campaign, operation: Permission.Create, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Campaign, operation: Permission.Read, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Campaign, operation: Permission.Update, accessLevel: AccessLevel.Team },
    { entity: PermissionEntity.Campaign, operation: Permission.Delete, accessLevel: AccessLevel.User },
  ],

  // ... otros roles
}
```

---

### Escenario 4: Deshabilitar Permisos Temporalmente

**Opción 1**: Comentar las líneas

```typescript
[UserRole.SalesRepresentative]: [
  // Temporalmente deshabilitado
  // { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.User },
],
```

**Opción 2**: Cambiar a AccessLevel.None

```typescript
[UserRole.SalesRepresentative]: [
  { entity: PermissionEntity.Lead, operation: Permission.Delete, accessLevel: AccessLevel.None },
],
```

---

## 📊 Reference Tables

### Tabla de Roles Disponibles

| Role                   | Código                          | Nivel Típico        |
|------------------------|---------------------------------|---------------------|
| System Administrator   | `SystemAdministrator`           | Organization        |
| Sales Manager          | `SalesManager`                  | Team                |
| Sales Representative   | `SalesRepresentative`           | User                |
| Customer Service Rep   | `CustomerServiceRep`            | User                |
| Marketing Professional | `MarketingProfessional`         | Team                |

### Tabla de Operaciones

| Operation | Descripción                    | Uso Común                      |
|-----------|--------------------------------|--------------------------------|
| Create    | Crear nuevos registros         | Formularios de creación        |
| Read      | Ver registros                  | Listas y detalles              |
| Update    | Modificar registros            | Formularios de edición         |
| Delete    | Eliminar registros             | Acciones de eliminación        |
| Share     | Compartir con otros usuarios   | Colaboración                   |
| Export    | Exportar datos (CSV, Excel)    | Reportes y análisis            |

### Tabla de Access Levels

| Access Level   | Descripción                              | Ejemplo                                    |
|----------------|------------------------------------------|--------------------------------------------|
| None           | Sin acceso                               | Bloquear completamente                     |
| User           | Solo registros propios (ownerid match)   | Sales Rep ve sus propios leads             |
| Team           | Registros del equipo                     | Manager ve leads de su equipo              |
| BusinessUnit   | Registros de la unidad de negocio        | Regional Manager ve su región              |
| Organization   | Todos los registros                      | Admin ve todo                              |

### Tabla de Entidades Protegidas

| Entity         | Descripción                    |
|----------------|--------------------------------|
| Lead           | Clientes potenciales           |
| Opportunity    | Oportunidades de venta         |
| Account        | Cuentas/Empresas               |
| Contact        | Contactos/Personas             |
| Quote          | Cotizaciones                   |
| Order          | Pedidos                        |
| Invoice        | Facturas                       |
| Product        | Productos                      |
| Activity       | Actividades (Email, Call, etc) |
| SystemUser     | Usuarios del sistema           |
| AuditLog       | Logs de auditoría              |

---

## 🔧 Configuración Avanzada

### Custom Access Level Logic

Si necesitas lógica personalizada (ej: "mismo territorio"), modifica `canAccessRecord()` en `permissions.ts:688-715`:

```typescript
export function canAccessRecord(
  userRole: UserRole,
  userId: string,
  entity: PermissionEntity,
  operation: Permission,
  recordOwnerId?: string
): boolean {
  const accessLevel = getAccessLevel(userRole, entity, operation)

  switch (accessLevel) {
    case AccessLevel.None:
      return false

    case AccessLevel.User:
      return recordOwnerId === userId

    case AccessLevel.Team:
      // 👇 PERSONALIZA AQUÍ
      // TODO: Implementar lógica de team membership
      // Por ahora permite acceso si es parte del team
      return true

    case AccessLevel.BusinessUnit:
      // 👇 PERSONALIZA AQUÍ
      // TODO: Implementar lógica de business unit
      return true

    case AccessLevel.Organization:
      return true

    default:
      return false
  }
}
```

---

## ✅ Checklist de Configuración

Cuando configures permisos para tu organización:

- [ ] **Revisar roles existentes** - ¿Necesitas todos? ¿Faltan algunos?
- [ ] **Definir matriz de permisos** - ¿Qué puede hacer cada rol en cada entidad?
- [ ] **Configurar Access Levels** - ¿User, Team, Organization?
- [ ] **Probar con usuarios reales** - Crear usuarios de prueba con cada rol
- [ ] **Validar casos edge** - ¿Qué pasa si un Manager intenta editar un Lead de otro equipo?
- [ ] **Documentar decisiones** - ¿Por qué este rol tiene estos permisos?
- [ ] **Revisar periódicamente** - ¿Los permisos siguen siendo apropiados?

---

## 🚨 Security Best Practices

1. **Principio de Menor Privilegio**
   - Dar solo los permisos mínimos necesarios
   - Empezar restrictivo, luego expandir según necesidad

2. **Separación de Funciones**
   - Finance no debería poder crear Leads
   - Sales no debería poder aprobar Invoices

3. **Audit Everything**
   - El sistema ya registra todas las acciones
   - Revisar audit logs periódicamente

4. **Access Level Correcto**
   - `User`: Para la mayoría de Sales Reps
   - `Team`: Para Managers
   - `Organization`: Solo Admin y roles específicos (Finance, etc)

5. **Testing**
   - Probar cada rol con usuarios reales
   - Verificar que NO puedan hacer lo prohibido
   - Verificar que SÍ puedan hacer lo permitido

---

## 🎯 Próximos Pasos

1. **Revisar Permission Matrix** - `src/core/contracts/security/permissions.ts`
2. **Personalizar según tu negocio** - Agregar/quitar permisos
3. **Probar con usuarios de prueba** - Crear usuarios con cada rol
4. **Implementar en features** - Usar `<PermissionGate>` y `usePermissions()`
5. **Monitorear audit logs** - Revisar quién hace qué

---

**Archivos Clave**:
- 📁 `src/core/contracts/security/permissions.ts` - PERMISSION MATRIX (PRINCIPAL)
- 📁 `src/core/contracts/entities/system-user.ts` - Roles definition
- 📁 `src/core/contracts/security/ownership.ts` - Ownership logic
- 📁 `SECURITY_INTEGRATION.md` - Integration examples

**¿Necesitas ayuda?** Consulta `SECURITY_INTEGRATION.md` para ejemplos de código.
