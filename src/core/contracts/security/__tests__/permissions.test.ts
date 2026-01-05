import {
  Permission,
  PermissionEntity,
  AccessLevel,
  hasPermission,
  getAccessLevel,
  getRolePermissions,
  canAccessRecord,
} from '../permissions'
import { UserRole } from '../../entities/system-user'

describe('Permissions System', () => {
  describe('hasPermission', () => {
    describe('System Administrator', () => {
      it('should have full access to all entities', () => {
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Lead, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Lead, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Lead, Permission.Update)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Lead, Permission.Delete)
        ).toBe(true)
      })

      it('should have access to all CRM entities', () => {
        expect(
          hasPermission(
            UserRole.SystemAdministrator,
            PermissionEntity.Opportunity,
            Permission.Create
          )
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Quote, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Order, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SystemAdministrator, PermissionEntity.Invoice, Permission.Create)
        ).toBe(true)
      })
    })

    describe('Sales Manager', () => {
      it('should have team-level access to sales entities', () => {
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Lead, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Lead, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Lead, Permission.Update)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Lead, Permission.Delete)
        ).toBe(true)
      })

      it('should have read access to products', () => {
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Product, Permission.Read)
        ).toBe(true)
      })

      it('should NOT have create/update access to products', () => {
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Product, Permission.Create)
        ).toBe(false)
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Product, Permission.Update)
        ).toBe(false)
      })

      it('should have access to quotes and opportunities', () => {
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Quote, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesManager, PermissionEntity.Opportunity, Permission.Update)
        ).toBe(true)
      })
    })

    describe('Sales Representative', () => {
      it('should have user-level access to own records', () => {
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Update)
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Delete)
        ).toBe(true)
      })

      it('should have access to opportunities and quotes', () => {
        expect(
          hasPermission(
            UserRole.SalesRepresentative,
            PermissionEntity.Opportunity,
            Permission.Create
          )
        ).toBe(true)
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Quote, Permission.Update)
        ).toBe(true)
      })

      it('should NOT have share permission', () => {
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Share)
        ).toBe(false)
      })

      it('should have read access to products', () => {
        expect(
          hasPermission(UserRole.SalesRepresentative, PermissionEntity.Product, Permission.Read)
        ).toBe(true)
      })
    })

    describe('Customer Service Rep', () => {
      it('should have limited access - read only for accounts', () => {
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Account, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Account, Permission.Create)
        ).toBe(false)
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Account, Permission.Delete)
        ).toBe(false)
      })

      it('should have access to orders and invoices', () => {
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Order, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Invoice, Permission.Read)
        ).toBe(true)
      })

      it('should NOT have access to leads or quotes', () => {
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Lead, Permission.Read)
        ).toBe(false)
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Quote, Permission.Read)
        ).toBe(false)
      })

      it('should have access to activities', () => {
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Activity, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.CustomerServiceRep, PermissionEntity.Activity, Permission.Read)
        ).toBe(true)
      })
    })

    describe('Marketing Professional', () => {
      it('should have team-level access to leads', () => {
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Read)
        ).toBe(true)
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Update)
        ).toBe(true)
      })

      it('should NOT have delete access to leads', () => {
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Delete)
        ).toBe(false)
      })

      it('should NOT have access to quotes or orders', () => {
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Quote, Permission.Read)
        ).toBe(false)
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Order, Permission.Read)
        ).toBe(false)
      })

      it('should have access to contacts', () => {
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Contact, Permission.Create)
        ).toBe(true)
        expect(
          hasPermission(UserRole.MarketingProfessional, PermissionEntity.Contact, Permission.Read)
        ).toBe(true)
      })
    })
  })

  describe('getAccessLevel', () => {
    it('should return Organization level for System Administrator', () => {
      expect(
        getAccessLevel(UserRole.SystemAdministrator, PermissionEntity.Lead, Permission.Read)
      ).toBe(AccessLevel.Organization)
    })

    it('should return Team level for Sales Manager', () => {
      expect(getAccessLevel(UserRole.SalesManager, PermissionEntity.Lead, Permission.Read)).toBe(
        AccessLevel.Team
      )
    })

    it('should return User level for Sales Representative', () => {
      expect(
        getAccessLevel(UserRole.SalesRepresentative, PermissionEntity.Lead, Permission.Read)
      ).toBe(AccessLevel.User)
    })

    it('should return None for missing permission', () => {
      expect(
        getAccessLevel(UserRole.CustomerServiceRep, PermissionEntity.Lead, Permission.Read)
      ).toBe(AccessLevel.None)
    })

    it('should return None for Customer Service Rep on quotes', () => {
      expect(
        getAccessLevel(UserRole.CustomerServiceRep, PermissionEntity.Quote, Permission.Read)
      ).toBe(AccessLevel.None)
    })

    it('should return Organization for Sales Manager reading products', () => {
      expect(
        getAccessLevel(UserRole.SalesManager, PermissionEntity.Product, Permission.Read)
      ).toBe(AccessLevel.Organization)
    })
  })

  describe('getRolePermissions', () => {
    it('should return all permissions for System Administrator', () => {
      const permissions = getRolePermissions(UserRole.SystemAdministrator)
      expect(permissions.length).toBeGreaterThan(50) // Admin has many permissions
      expect(permissions.every((p) => p.accessLevel === AccessLevel.Organization)).toBe(true)
    })

    it('should return all permissions for Sales Manager', () => {
      const permissions = getRolePermissions(UserRole.SalesManager)
      expect(permissions.length).toBeGreaterThan(20)
      expect(permissions.some((p) => p.accessLevel === AccessLevel.Team)).toBe(true)
    })

    it('should return all permissions for Sales Representative', () => {
      const permissions = getRolePermissions(UserRole.SalesRepresentative)
      expect(permissions.length).toBeGreaterThan(10)
      expect(permissions.every((p) => p.accessLevel === AccessLevel.User || p.accessLevel === AccessLevel.Organization)).toBe(true)
    })

    it('should return empty array for undefined role', () => {
      const permissions = getRolePermissions('InvalidRole' as UserRole)
      expect(permissions).toEqual([])
    })

    it('should return specific permissions for Customer Service Rep', () => {
      const permissions = getRolePermissions(UserRole.CustomerServiceRep)
      expect(permissions.length).toBeGreaterThan(5)
      expect(permissions.some((p) => p.entity === PermissionEntity.Order)).toBe(true)
      expect(permissions.some((p) => p.entity === PermissionEntity.Invoice)).toBe(true)
    })
  })

  describe('canAccessRecord', () => {
    describe('AccessLevel.None', () => {
      it('should deny access when no permission exists', () => {
        expect(
          canAccessRecord(
            UserRole.CustomerServiceRep,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            'owner-456'
          )
        ).toBe(false)
      })
    })

    describe('AccessLevel.User (own records only)', () => {
      it('should allow access to own record', () => {
        expect(
          canAccessRecord(
            UserRole.SalesRepresentative,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            'user-123' // Same user ID
          )
        ).toBe(true)
      })

      it('should deny access to other user record', () => {
        expect(
          canAccessRecord(
            UserRole.SalesRepresentative,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            'user-456' // Different user ID
          )
        ).toBe(false)
      })

      it('should deny access when recordOwnerId is undefined', () => {
        expect(
          canAccessRecord(
            UserRole.SalesRepresentative,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            undefined
          )
        ).toBe(false)
      })
    })

    describe('AccessLevel.Team', () => {
      it('should allow access to team records', () => {
        // Sales Manager has Team level access
        expect(
          canAccessRecord(
            UserRole.SalesManager,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            'user-456' // Different user (team member)
          )
        ).toBe(true)
      })

      it('should allow access even without recordOwnerId', () => {
        expect(
          canAccessRecord(
            UserRole.SalesManager,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            undefined
          )
        ).toBe(true)
      })
    })

    describe('AccessLevel.Organization', () => {
      it('should allow access to all records', () => {
        expect(
          canAccessRecord(
            UserRole.SystemAdministrator,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            'user-456'
          )
        ).toBe(true)
      })

      it('should allow access even without recordOwnerId', () => {
        expect(
          canAccessRecord(
            UserRole.SystemAdministrator,
            'user-123',
            PermissionEntity.Lead,
            Permission.Read,
            undefined
          )
        ).toBe(true)
      })

      it('should allow access for any user ID', () => {
        expect(
          canAccessRecord(
            UserRole.SystemAdministrator,
            'user-123',
            PermissionEntity.Lead,
            Permission.Delete,
            'user-999'
          )
        ).toBe(true)
      })
    })

    describe('Delete permissions with different access levels', () => {
      it('should allow Sales Rep to delete own records', () => {
        expect(
          canAccessRecord(
            UserRole.SalesRepresentative,
            'user-123',
            PermissionEntity.Lead,
            Permission.Delete,
            'user-123'
          )
        ).toBe(true)
      })

      it('should deny Sales Rep from deleting other records', () => {
        expect(
          canAccessRecord(
            UserRole.SalesRepresentative,
            'user-123',
            PermissionEntity.Lead,
            Permission.Delete,
            'user-456'
          )
        ).toBe(false)
      })

      it('should allow Sales Manager to delete team records', () => {
        expect(
          canAccessRecord(
            UserRole.SalesManager,
            'manager-1',
            PermissionEntity.Lead,
            Permission.Delete,
            'rep-1'
          )
        ).toBe(true)
      })
    })
  })

  describe('Permission hierarchy', () => {
    it('should show System Administrator has highest access', () => {
      const adminLevel = getAccessLevel(
        UserRole.SystemAdministrator,
        PermissionEntity.Lead,
        Permission.Read
      )
      const managerLevel = getAccessLevel(
        UserRole.SalesManager,
        PermissionEntity.Lead,
        Permission.Read
      )
      const repLevel = getAccessLevel(
        UserRole.SalesRepresentative,
        PermissionEntity.Lead,
        Permission.Read
      )

      expect(adminLevel).toBe(AccessLevel.Organization)
      expect(managerLevel).toBe(AccessLevel.Team)
      expect(repLevel).toBe(AccessLevel.User)
    })

    it('should show Marketing Professional has limited access compared to Sales Manager', () => {
      // Marketing can read leads at Team level
      expect(
        hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Read)
      ).toBe(true)

      // But cannot delete (Sales Manager can)
      expect(
        hasPermission(UserRole.MarketingProfessional, PermissionEntity.Lead, Permission.Delete)
      ).toBe(false)
      expect(
        hasPermission(UserRole.SalesManager, PermissionEntity.Lead, Permission.Delete)
      ).toBe(true)
    })
  })
})
