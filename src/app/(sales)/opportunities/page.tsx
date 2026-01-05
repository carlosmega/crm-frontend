'use client'

import { OpportunitiesClient } from './opportunities-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useOpportunities() maneja la autenticación correctamente
 */
export default function OpportunitiesPage() {
  // OpportunitiesClient maneja su propia carga de datos con useOpportunities()
  return <OpportunitiesClient />
}
