'use client'

import { AccountsClient } from './accounts-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useAccounts() maneja la autenticación correctamente
 */
export default function AccountsPage() {
  // AccountsClient maneja su propia carga de datos con useAccounts()
  return <AccountsClient />
}
