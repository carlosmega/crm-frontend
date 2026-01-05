/**
 * Next.js Middleware
 * Handles authentication and route protection
 */

import NextAuth from 'next-auth'
import { authConfig } from './src/core/auth/auth.config'

export default NextAuth(authConfig).auth

export const config = {
  // Match all routes except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
