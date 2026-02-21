/**
 * NextAuth Configuration
 * Core auth configuration for the CRM
 */

import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { featureFlags } from '@/core/config/api.config'
import { authService } from '@/features/auth/api/auth-service'
import { authenticateUser } from '@/core/services/users-service'
import type { UserSession } from '@/core/contracts/entities'
import { UserRole } from '@/core/contracts/entities'

/**
 * Map Django role_name (string) to UserRole enum
 */
function mapRoleNameToUserRole(roleName: string | undefined): UserRole {
  if (!roleName) return UserRole.SalesRepresentative

  const name = roleName.toLowerCase()

  // Map Django role names (with spaces) to UserRole enum
  const roleMap: Record<string, UserRole> = {
    'system administrator': UserRole.SystemAdministrator,
    'system-administrator': UserRole.SystemAdministrator,
    'sales manager': UserRole.SalesManager,
    'sales-manager': UserRole.SalesManager,
    'salesperson': UserRole.SalesRepresentative,
    'sales-representative': UserRole.SalesRepresentative,
    'marketing user': UserRole.MarketingProfessional,
    'marketing-professional': UserRole.MarketingProfessional,
    'read-only user': UserRole.CustomerServiceRep,
    'customer-service-rep': UserRole.CustomerServiceRep,
  }

  return roleMap[name] || UserRole.SalesRepresentative
}

/**
 * NextAuth configuration object
 * Used by both middleware and API routes
 */
export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@crm.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const password = credentials.password as string

          // Usar backend Django o servicio mock según feature flag
          if (featureFlags.useBackendAPI) {
            // Check if this is SSO with pre-fetched user data
            // User data was already obtained by the browser's exchange call
            if (password.startsWith('sso_data:')) {
              const encoded = password.slice(9)
              const user = JSON.parse(Buffer.from(encoded, 'base64').toString())

              return {
                id: user.systemuserid,
                email: user.emailaddress1,
                name: user.fullname,
                role: mapRoleNameToUserRole(user.role_name),
              }
            }

            // BACKEND DJANGO: Autenticar con Django
            const response = await authService.login({
              emailaddress1: credentials.email as string,
              password: password,
            })

            if (!response.user) {
              return null
            }

            // Return user object that will be stored in session
            // Django devuelve systemuserid y role_name (no contactid y role)
            return {
              id: response.user.systemuserid,
              email: response.user.emailaddress1,
              name: response.user.fullname,
              role: mapRoleNameToUserRole(response.user.role_name),
            }
          } else {
            // MOCK: Usar servicio local
            const user = await authenticateUser(
              credentials.email as string,
              credentials.password as string
            )

            if (!user) {
              return null
            }

            // Return user object that will be stored in session
            return {
              id: user.systemuserid,
              email: user.internalemailaddress,
              name: user.fullname,
              role: user.role,
            }
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.role = (user as UserSession).role
      }
      return token
    },
    async session({ session, token }) {
      // Add custom fields to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnLeads = nextUrl.pathname.startsWith('/leads')
      const isOnOpportunities = nextUrl.pathname.startsWith('/opportunities')
      const isOnAccounts = nextUrl.pathname.startsWith('/accounts')
      const isOnContacts = nextUrl.pathname.startsWith('/contacts')
      const isOnQuotes = nextUrl.pathname.startsWith('/quotes')
      const isOnOrders = nextUrl.pathname.startsWith('/orders')
      const isOnInvoices = nextUrl.pathname.startsWith('/invoices')
      const isOnProducts = nextUrl.pathname.startsWith('/products')
      const isOnActivities = nextUrl.pathname.startsWith('/activities')
      const isOnSettings = nextUrl.pathname.startsWith('/settings')

      const isOnProtectedRoute =
        isOnDashboard ||
        isOnLeads ||
        isOnOpportunities ||
        isOnAccounts ||
        isOnContacts ||
        isOnQuotes ||
        isOnOrders ||
        isOnInvoices ||
        isOnProducts ||
        isOnActivities ||
        isOnSettings

      if (isOnProtectedRoute) {
        if (!isLoggedIn) return false
        return true
      }

      // Allow access to login and other public pages
      return true
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
