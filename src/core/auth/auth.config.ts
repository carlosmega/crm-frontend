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

  // Map common Django role names to UserRole enum
  const roleMap: Record<string, UserRole> = {
    'system-administrator': UserRole.SystemAdministrator,
    'sales-manager': UserRole.SalesManager,
    'sales-representative': UserRole.SalesRepresentative,
    'customer-service-rep': UserRole.CustomerServiceRep,
    'marketing-professional': UserRole.MarketingProfessional,
  }

  return roleMap[roleName.toLowerCase()] || UserRole.SalesRepresentative
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
          // Usar backend Django o servicio mock según feature flag
          if (featureFlags.useBackendAPI) {
            // BACKEND DJANGO: Autenticar con Django
            const response = await authService.login({
              emailaddress1: credentials.email as string,
              password: credentials.password as string,
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
