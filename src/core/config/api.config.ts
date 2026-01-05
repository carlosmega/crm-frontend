/**
 * API Configuration
 *
 * Configuración central para el cliente HTTP y feature flags
 */

export const apiConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 segundos
  withCredentials: true, // CRÍTICO: Habilita cookies de sesión y CSRF
  headers: {
    'Content-Type': 'application/json',
  },
} as const

/**
 * Feature Flags
 *
 * Controla el comportamiento de la aplicación mediante variables de entorno
 */
export const featureFlags = {
  /**
   * Usa el backend Django real en lugar de mocks de localStorage
   * Por defecto: true (backend activo)
   */
  useBackendAPI: process.env.NEXT_PUBLIC_USE_BACKEND_API !== 'false',
} as const
