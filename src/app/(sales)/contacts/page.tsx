'use client'

import { ContactsClient } from './contacts-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useContacts() maneja la autenticación correctamente
 */
export default function ContactsPage() {
  // ContactsClient maneja su propia carga de datos con useContacts()
  return <ContactsClient />
}
