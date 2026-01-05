/**
 * Auth Layout
 * Layout for authentication pages (login, register, etc.)
 * No sidebar, clean layout
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | CRM Sales',
  description: 'Inicia sesión en tu CRM de ventas',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
