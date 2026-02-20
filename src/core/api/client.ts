/**
 * API Client
 *
 * Cliente HTTP centralizado con axios para todas las peticiones al backend Django
 *
 * Características:
 * - Inyección automática de CSRF tokens en mutaciones
 * - Transformación automática de errores a formato estándar
 * - Soporte para cookies de sesión (withCredentials)
 * - Unwrapping de respuestas Django {success: true, data: T}
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { apiConfig } from '@/core/config/api.config'
import { getCsrfToken, shouldIncludeCsrfToken } from './csrf-handler'
import { transformBackendError } from './error-transformer'

/**
 * Instancia de axios configurada para el backend Django
 */
const apiClient: AxiosInstance = axios.create(apiConfig)

/**
 * REQUEST INTERCEPTOR
 *
 * Inyecta automáticamente el token CSRF en peticiones de mutación (POST, PATCH, PUT, DELETE)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Auto-detect FormData: remove Content-Type so browser sets it with boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    }

    // Solo agregar CSRF token en mutaciones
    if (shouldIncludeCsrfToken(config.method)) {
      const csrfToken = getCsrfToken()
      if (csrfToken && config.headers) {
        config.headers['X-CSRFToken'] = csrfToken
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * RESPONSE INTERCEPTOR
 *
 * Transforma automáticamente errores de Django al formato ApiErrorResponse estándar
 */
apiClient.interceptors.response.use(
  // Respuestas exitosas pasan sin modificación
  (response) => response,
  // Errores se transforman al formato estándar
  (error: AxiosError) => {
    const transformedError = transformBackendError(error)
    return Promise.reject(transformedError)
  }
)

export default apiClient

/**
 * Helper: Unwrap Django Response
 *
 * Django devuelve respuestas en formato {success: true, data: T}
 * Esta función extrae el campo 'data' automáticamente
 *
 * @param promise - Promise de axios que devuelve {data: {success: true, data: T}}
 * @returns Promise con el dato desenvuelto (T)
 *
 * @example
 * ```typescript
 * // Sin unwrap (tedioso):
 * const response = await apiClient.get('/contacts')
 * const contacts = response.data.data // ❌ Doble .data
 *
 * // Con unwrap (limpio):
 * const contacts = await unwrapBackendResponse(
 *   apiClient.get('/contacts')
 * ) // ✅ Resultado directo
 * ```
 */
export async function unwrapBackendResponse<T>(
  promise: Promise<{ data: { success: boolean; data: T } }>
): Promise<T> {
  const response = await promise
  return response.data.data // Extraer dato del wrapper Django
}
