# Security System - Integration Guide

> **Fase 6A: Security MVP - Implementation Complete**
>
> This guide explains how to integrate RBAC, Audit Logging, and Record Ownership into your features.

---

## 🔒 RBAC (Role-Based Access Control)

### 1. Using Permissions in Server Components

```typescript
// app/leads/page.tsx (Server Component)
import { auth } from '@/core/auth/auth'
import { hasPermission } from '@/core/contracts/security'
import { Permission, PermissionEntity } from '@/core/contracts/security'
import { UserRole } from '@/core/contracts/entities'

export default async function LeadsPage() {
  const session = await auth()
  const userRole = session?.user?.role as UserRole

  const canCreateLead = hasPermission(userRole, PermissionEntity.Lead, Permission.Create)

  return (
    <div>
      <h1>Leads</h1>
      {canCreateLead && <Button>Create Lead</Button>}
    </div>
  )
}
```

### 2. Using Permissions in Client Components

```typescript
// components/lead-actions.tsx (Client Component)
'use client'

import { usePermissions } from '@/shared/hooks/use-permissions'
import { PermissionEntity, Permission } from '@/core/contracts/security'
import { Button } from '@/shared/components/ui/button'

export function LeadActions({ leadId }: { leadId: string }) {
  const { canUpdate, canDelete } = usePermissions()

  return (
    <div className="flex gap-2">
      {canUpdate(PermissionEntity.Lead) && (
        <Button>Edit Lead</Button>
      )}
      {canDelete(PermissionEntity.Lead) && (
        <Button variant="destructive">Delete Lead</Button>
      )}
    </div>
  )
}
```

### 3. Using Permission Components

```typescript
// Using PermissionGate
import { PermissionGate } from '@/shared/components/security'
import { PermissionEntity, Permission } from '@/core/contracts/security'

<PermissionGate entity={PermissionEntity.Lead} operation={Permission.Create}>
  <Button>Create Lead</Button>
</PermissionGate>

// Using ProtectedButton
import { ProtectedButton } from '@/shared/components/security'

<ProtectedButton
  entity={PermissionEntity.Lead}
  operation={Permission.Delete}
  variant="destructive"
  hideWhenDenied={true}
>
  Delete Lead
</ProtectedButton>
```

---

## 📝 Audit Logging

### 1. Logging Create Operations

```typescript
// features/leads/api/lead-service.ts
import { logCreate } from '@/core/services/audit-log-service'
import { PermissionEntity } from '@/core/contracts/security'

export async function createLead(dto: CreateLeadDto, session: Session) {
  // Create lead
  const lead = await db.create(dto)

  // Log audit
  await logCreate(
    PermissionEntity.Lead,
    lead.leadid,
    lead.fullname,
    session.user.id,
    session.user.name,
    session.user.role
  )

  return lead
}
```

### 2. Logging Update Operations

```typescript
import { logUpdate } from '@/core/services/audit-log-service'

export async function updateLead(id: string, dto: UpdateLeadDto, session: Session) {
  // Get old values
  const oldLead = await db.findById(id)

  // Update lead
  const newLead = await db.update(id, dto)

  // Track changes
  const changes = []
  if (oldLead.leadqualitycode !== newLead.leadqualitycode) {
    changes.push({
      fieldName: 'leadqualitycode',
      oldValue: oldLead.leadqualitycode,
      newValue: newLead.leadqualitycode,
    })
  }

  // Log audit
  await logUpdate(
    PermissionEntity.Lead,
    id,
    newLead.fullname,
    session.user.id,
    session.user.name,
    session.user.role,
    changes
  )

  return newLead
}
```

### 3. Logging Custom Actions

```typescript
import { logAction } from '@/core/services/audit-log-service'
import { AuditAction } from '@/core/contracts/entities'

export async function qualifyLead(id: string, session: Session) {
  // Qualify lead
  const lead = await db.qualify(id)

  // Log custom action
  await logAction(
    AuditAction.Qualify,
    PermissionEntity.Lead,
    lead.leadid,
    lead.fullname,
    session.user.id,
    session.user.name,
    session.user.role,
    `Qualified lead "${lead.fullname}" - created Opportunity`
  )

  return lead
}
```

### 4. Displaying Audit Trail in UI

```typescript
// app/leads/[id]/page.tsx
import { AuditTrail } from '@/shared/components/security'
import { PermissionEntity } from '@/core/contracts/security'

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Lead Details</h1>
      {/* Other lead details */}

      {/* Audit Trail */}
      <AuditTrail entity={PermissionEntity.Lead} recordid={params.id} />
    </div>
  )
}
```

---

## 👤 Record Ownership

### 1. Filtering by Owner

```typescript
import { filterOwnedRecords } from '@/core/contracts/security'
import { useSession } from 'next-auth/react'

export function MyLeadsPage() {
  const { data: session } = useSession()
  const { data: allLeads } = useLeads()

  // Filter to show only user's leads
  const myLeads = filterOwnedRecords(allLeads, session?.user?.id)

  return <LeadList leads={myLeads} />
}
```

### 2. Checking Record Access

```typescript
import { canAccessRecord } from '@/core/contracts/security'

export async function updateLead(leadId: string, dto: UpdateLeadDto, session: Session) {
  const lead = await getLeadById(leadId)

  // Check if user can update this specific record
  const hasAccess = canAccessRecord(
    session.user.role,
    session.user.id,
    PermissionEntity.Lead,
    Permission.Update,
    lead.ownerid
  )

  if (!hasAccess) {
    throw new Error('You do not have permission to update this lead')
  }

  return db.update(leadId, dto)
}
```

### 3. Using Record Ownership in Components

```typescript
'use client'

import { isRecordOwner } from '@/core/contracts/security'
import { useSession } from 'next-auth/react'

export function LeadCard({ lead }: { lead: Lead }) {
  const { data: session } = useSession()
  const isOwner = isRecordOwner(lead, session?.user?.id)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lead.fullname}</CardTitle>
        {isOwner && <Badge>Owner</Badge>}
      </CardHeader>
    </Card>
  )
}
```

---

## 🎯 Complete Integration Example

Here's a complete example integrating all security features:

```typescript
// app/leads/[id]/page.tsx
import { auth } from '@/core/auth/auth'
import { hasPermission, canAccessRecord } from '@/core/contracts/security'
import { Permission, PermissionEntity } from '@/core/contracts/security'
import { AuditTrail } from '@/shared/components/security'
import { getLeadById } from '@/features/leads/api/lead-service'
import { redirect } from 'next/navigation'

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  // Get lead
  const lead = await getLeadById(params.id)

  // Check if user can read this specific lead
  const canRead = canAccessRecord(
    session.user.role,
    session.user.id,
    PermissionEntity.Lead,
    Permission.Read,
    lead.ownerid
  )

  if (!canRead) {
    return <div>You do not have permission to view this lead</div>
  }

  // Check permissions for actions
  const canUpdate = canAccessRecord(
    session.user.role,
    session.user.id,
    PermissionEntity.Lead,
    Permission.Update,
    lead.ownerid
  )

  const canDelete = canAccessRecord(
    session.user.role,
    session.user.id,
    PermissionEntity.Lead,
    Permission.Delete,
    lead.ownerid
  )

  return (
    <div>
      <h1>{lead.fullname}</h1>

      {/* Actions */}
      <div className="flex gap-2">
        {canUpdate && <Button>Edit</Button>}
        {canDelete && <Button variant="destructive">Delete</Button>}
      </div>

      {/* Lead details */}
      <LeadDetails lead={lead} />

      {/* Audit Trail */}
      <AuditTrail entity={PermissionEntity.Lead} recordid={params.id} />
    </div>
  )
}
```

---

## 📊 Role Permission Matrix

| Role                  | Leads | Opportunities | Quotes | Access Level |
|-----------------------|-------|---------------|--------|--------------|
| System Administrator  | CRUD+ | CRUD+         | CRUD+  | Organization |
| Sales Manager         | CRUD+ | CRUD+         | CRUD+  | Team         |
| Sales Representative  | CRUD  | CRUD          | CRUD   | User         |
| Customer Service Rep  | R     | R             | R      | User         |
| Marketing Professional| CRU   | R             | -      | Team         |

**Legend**: C = Create, R = Read, U = Update, D = Delete, + = Share/Export

---

## ✅ Integration Checklist

When adding security to a new feature:

- [ ] **Server Components**: Use `hasPermission()` for permission checks
- [ ] **Client Components**: Use `usePermissions()` hook
- [ ] **UI Protection**: Use `<PermissionGate>` or `<ProtectedButton>`
- [ ] **Audit Create**: Call `logCreate()` after creating records
- [ ] **Audit Update**: Call `logUpdate()` with field changes
- [ ] **Audit Custom**: Call `logAction()` for special operations (Qualify, Win, etc.)
- [ ] **Record Access**: Use `canAccessRecord()` for record-level checks
- [ ] **Ownership Filter**: Use `filterOwnedRecords()` when showing user's records
- [ ] **Audit Trail UI**: Add `<AuditTrail>` component to detail pages

---

## 🚀 Next Steps (Phase 6B - Advanced Security)

**Coming Soon**:
- Field-Level Security (hide sensitive fields by role)
- Business Units (organizational hierarchy)
- Sharing Rules (share specific records with users/teams)
- Advanced Audit Reports (compliance exports, GDPR)

---

**Last Updated**: 2025-01-15
**Phase**: 6A - Security MVP ✅ COMPLETE
