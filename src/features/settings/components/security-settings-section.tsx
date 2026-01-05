/**
 * Security Settings Section
 * Displays permission matrix and security configuration
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, Users, Lock, FileText, Eye } from 'lucide-react'
import { UserRole, getUserRoleDisplayName } from '@/core/contracts/entities'
import {
  Permission,
  PermissionEntity,
  AccessLevel,
  ROLE_PERMISSIONS,
  getRolePermissions,
} from '@/core/contracts/security'
import { useIsAdmin } from '@/shared/hooks/use-permissions'

/**
 * Get badge variant for access level
 */
function getAccessLevelVariant(level: AccessLevel): 'default' | 'secondary' | 'outline' {
  switch (level) {
    case AccessLevel.Organization:
      return 'default'
    case AccessLevel.Team:
      return 'secondary'
    case AccessLevel.User:
      return 'outline'
    default:
      return 'outline'
  }
}

/**
 * Get icon for access level
 */
function getAccessLevelIcon(level: AccessLevel): string {
  switch (level) {
    case AccessLevel.Organization:
      return '🌐'
    case AccessLevel.Team:
      return '👥'
    case AccessLevel.User:
      return '🔒'
    default:
      return '❌'
  }
}

/**
 * Get display name for access level
 */
function getAccessLevelDisplayName(level: AccessLevel): string {
  switch (level) {
    case AccessLevel.None:
      return 'None'
    case AccessLevel.User:
      return 'User'
    case AccessLevel.Team:
      return 'Team'
    case AccessLevel.BusinessUnit:
      return 'Business Unit'
    case AccessLevel.Organization:
      return 'Organization'
    default:
      return 'Unknown'
  }
}

/**
 * Get display name for permission
 */
function getPermissionDisplayName(permission: Permission): string {
  const names: Record<Permission, string> = {
    [Permission.Create]: 'Create',
    [Permission.Read]: 'Read',
    [Permission.Update]: 'Update',
    [Permission.Delete]: 'Delete',
    [Permission.Share]: 'Share',
    [Permission.Export]: 'Export',
  }
  return names[permission]
}

/**
 * Get display name for entity
 */
function getEntityDisplayName(entity: PermissionEntity): string {
  const names: Record<PermissionEntity, string> = {
    [PermissionEntity.Lead]: 'Leads',
    [PermissionEntity.Opportunity]: 'Opportunities',
    [PermissionEntity.Account]: 'Accounts',
    [PermissionEntity.Contact]: 'Contacts',
    [PermissionEntity.Quote]: 'Quotes',
    [PermissionEntity.QuoteDetail]: 'Quote Lines',
    [PermissionEntity.Order]: 'Orders',
    [PermissionEntity.OrderDetail]: 'Order Lines',
    [PermissionEntity.Invoice]: 'Invoices',
    [PermissionEntity.InvoiceDetail]: 'Invoice Lines',
    [PermissionEntity.Product]: 'Products',
    [PermissionEntity.Activity]: 'Activities',
    [PermissionEntity.SystemUser]: 'Users',
    [PermissionEntity.AuditLog]: 'Audit Logs',
  }
  return names[entity] || entity
}

/**
 * Role Summary Card
 */
function RoleSummaryCard({ role }: { role: UserRole }) {
  const permissions = getRolePermissions(role)
  const entitiesWithAccess = new Set(permissions.map((p) => p.entity))

  // Count permissions by type
  const permissionCounts = {
    create: permissions.filter((p) => p.operation === Permission.Create).length,
    read: permissions.filter((p) => p.operation === Permission.Read).length,
    update: permissions.filter((p) => p.operation === Permission.Update).length,
    delete: permissions.filter((p) => p.operation === Permission.Delete).length,
    share: permissions.filter((p) => p.operation === Permission.Share).length,
    export: permissions.filter((p) => p.operation === Permission.Export).length,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {getUserRoleDisplayName(role)}
        </CardTitle>
        <CardDescription>
          {permissions.length} total permissions across {entitiesWithAccess.size} entities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Permission counts */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {permissionCounts.create > 0 && (
            <Badge variant="outline">Create: {permissionCounts.create}</Badge>
          )}
          {permissionCounts.read > 0 && (
            <Badge variant="outline">Read: {permissionCounts.read}</Badge>
          )}
          {permissionCounts.update > 0 && (
            <Badge variant="outline">Update: {permissionCounts.update}</Badge>
          )}
          {permissionCounts.delete > 0 && (
            <Badge variant="outline">Delete: {permissionCounts.delete}</Badge>
          )}
          {permissionCounts.share > 0 && (
            <Badge variant="outline">Share: {permissionCounts.share}</Badge>
          )}
          {permissionCounts.export > 0 && (
            <Badge variant="outline">Export: {permissionCounts.export}</Badge>
          )}
        </div>

        {/* Entities with access */}
        <div>
          <p className="mb-2 text-sm font-medium">Entities with Access:</p>
          <div className="flex flex-wrap gap-1">
            {Array.from(entitiesWithAccess).map((entity) => (
              <Badge key={entity} variant="secondary" className="text-xs">
                {getEntityDisplayName(entity)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Permission Matrix Table
 */
function PermissionMatrixTable({ role }: { role: UserRole }) {
  const permissions = getRolePermissions(role)

  // Group by entity
  const permissionsByEntity = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.entity]) {
        acc[perm.entity] = []
      }
      acc[perm.entity].push(perm)
      return acc
    },
    {} as Record<PermissionEntity, typeof permissions>
  )

  return (
    <div className="space-y-4">
      {Object.entries(permissionsByEntity).map(([entity, perms]) => (
        <Card key={entity}>
          <CardHeader>
            <CardTitle className="text-lg">{getEntityDisplayName(entity as PermissionEntity)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {perms.map((perm) => (
                <div key={`${perm.operation}`} className="flex items-center gap-2">
                  <span className="text-sm">{getPermissionDisplayName(perm.operation)}:</span>
                  <Badge variant={getAccessLevelVariant(perm.accessLevel)} className="text-xs">
                    {getAccessLevelIcon(perm.accessLevel)} {getAccessLevelDisplayName(perm.accessLevel)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Security Settings Section Component
 */
export function SecuritySettingsSection() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) {
    return (
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You need System Administrator privileges to view security settings.
        </AlertDescription>
      </Alert>
    )
  }

  const roles = Object.values(UserRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security & Permissions</h2>
        <p className="text-muted-foreground">
          View and understand role-based access control (RBAC) configuration
        </p>
      </div>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentation
          </CardTitle>
          <CardDescription>Learn how to configure permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <Eye className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">PERMISSION_MATRIX.md</p>
              <p className="text-sm text-muted-foreground">
                Visual reference of all current permissions by role and entity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">SECURITY_CONFIG_GUIDE.md</p>
              <p className="text-sm text-muted-foreground">
                Step-by-step guide to modify roles and permissions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="mt-1 h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">SECURITY_INTEGRATION.md</p>
              <p className="text-sm text-muted-foreground">
                Code examples for using permissions in your features
              </p>
            </div>
          </div>
          <Alert className="mt-4">
            <Shield className="h-4 w-4" />
            <AlertTitle>Configuration Files</AlertTitle>
            <AlertDescription>
              To modify permissions, edit:{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                src/core/contracts/security/permissions.ts
              </code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Role Tabs */}
      <Tabs defaultValue={UserRole.SystemAdministrator} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          {roles.map((role) => (
            <TabsTrigger key={role} value={role} className="text-xs">
              {getUserRoleDisplayName(role).split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {roles.map((role) => (
          <TabsContent key={role} value={role} className="space-y-4">
            {/* Role Summary */}
            <RoleSummaryCard role={role} />

            {/* Permission Matrix */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Detailed Permissions</h3>
              <PermissionMatrixTable role={role} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
