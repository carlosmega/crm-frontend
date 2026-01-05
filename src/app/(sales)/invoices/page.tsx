'use client'

import { InvoicesClient } from './invoices-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useInvoices() maneja la autenticación correctamente
 */
export default function InvoicesPage() {
  // InvoicesClient maneja su propia carga de datos con useInvoices()
  return <InvoicesClient />
}
