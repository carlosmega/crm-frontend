'use client'

import { LeadsClient } from './leads-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useLeads() maneja la autenticación correctamente
 */
export default function LeadsPage() {
  // LeadsClient maneja su propia carga de datos con useLeads()
  return <LeadsClient />
}
