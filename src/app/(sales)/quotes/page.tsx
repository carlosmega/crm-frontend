'use client'

import { QuotesClient } from './quotes-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useQuotes() maneja la autenticación correctamente
 */
export default function QuotesPage() {
  // QuotesClient maneja su propia carga de datos con useQuotes()
  return <QuotesClient />
}
