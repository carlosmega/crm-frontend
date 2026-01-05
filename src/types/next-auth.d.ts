/**
 * NextAuth Type Extensions
 * Extends default NextAuth types with custom user fields
 */

import { UserRole } from '@/core/contracts/entities'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}
