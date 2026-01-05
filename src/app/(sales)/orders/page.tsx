'use client'

import { OrdersClient } from './orders-client'

/**
 * ✅ Client Component - Fetches data on the client with authentication
 *
 * IMPORTANTE: Debe ser Client Component porque:
 * - Django requiere cookies de sesión para autenticación
 * - Las cookies solo están disponibles en el navegador (no en SSR)
 * - El hook useOrders() maneja la autenticación correctamente
 */
export default function OrdersPage() {
  // OrdersClient maneja su propia carga de datos con useOrders()
  return <OrdersClient />
}
