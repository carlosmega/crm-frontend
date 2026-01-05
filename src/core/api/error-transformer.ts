/**
 * Error Transformer
 *
 * Transforma errores de Axios/Django al formato estándar ApiErrorResponse
 */

import { AxiosError } from 'axios'
import type { ApiErrorResponse } from '@/core/contracts/api/api-response'
import { ApiErrorCode } from '@/core/contracts/api/api-response'

/**
 * Estructura de error que Django devuelve (formato confirmado por usuario)
 */
interface DjangoErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

/**
 * Transforma errores de Axios/Django en ApiErrorResponse estándar
 *
 * Maneja 3 casos:
 * 1. Django devuelve {success: false, error: {...}}
 * 2. Error de red (sin respuesta del servidor)
 * 3. Error HTTP sin formato Django (fallback a status code)
 *
 * @param error - Error de Axios
 * @returns Error transformado en formato ApiErrorResponse
 */
export function transformBackendError(error: AxiosError): ApiErrorResponse {
  // CASO 1: Django formateó el error con {success: false, error: {...}}
  const djangoError = error.response?.data as DjangoErrorResponse | undefined

  if (djangoError && !djangoError.success && djangoError.error) {
    return {
      success: false,
      error: {
        code: mapDjangoErrorCode(djangoError.error.code, error.response?.status),
        message: djangoError.error.message || 'Error del servidor',
        details: djangoError.error.details,
      },
    }
  }

  // CASO 2: Error de red (no hay respuesta del servidor)
  if (!error.response) {
    return {
      success: false,
      error: {
        code: ApiErrorCode.NETWORK_ERROR,
        message: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      },
    }
  }

  // CASO 3: Error HTTP sin formato Django (fallback)
  const statusCode = error.response.status
  return {
    success: false,
    error: {
      code: mapHttpStatusToErrorCode(statusCode),
      message: getDefaultErrorMessage(statusCode),
      details: extractDjangoFieldErrors(error.response.data),
    },
  }
}

/**
 * Mapea códigos de error de Django a nuestro enum ApiErrorCode
 *
 * @param djangoCode - Código de error que Django envía
 * @param statusCode - Status HTTP (opcional, para fallback)
 * @returns Código de error estándar
 */
function mapDjangoErrorCode(djangoCode: string, statusCode?: number): string {
  const codeMap: Record<string, string> = {
    VALIDATION_ERROR: ApiErrorCode.VALIDATION_ERROR,
    NOT_FOUND: ApiErrorCode.NOT_FOUND,
    UNAUTHORIZED: ApiErrorCode.UNAUTHORIZED,
    FORBIDDEN: ApiErrorCode.FORBIDDEN,
    DUPLICATE_ENTRY: ApiErrorCode.ALREADY_EXISTS,
    CONFLICT: ApiErrorCode.CONFLICT,
    NETWORK_ERROR: ApiErrorCode.NETWORK_ERROR,
    INTERNAL_ERROR: ApiErrorCode.INTERNAL_SERVER_ERROR,
    SERVICE_UNAVAILABLE: ApiErrorCode.SERVICE_UNAVAILABLE,
    TIMEOUT: ApiErrorCode.TIMEOUT,
    INVALID_INPUT: ApiErrorCode.INVALID_INPUT,
    REQUIRED_FIELD_MISSING: ApiErrorCode.REQUIRED_FIELD_MISSING,
  }

  // Si el código Django está mapeado, usarlo
  if (codeMap[djangoCode]) {
    return codeMap[djangoCode]
  }

  // Fallback al status HTTP
  return mapHttpStatusToErrorCode(statusCode || 500)
}

/**
 * Mapea códigos de estado HTTP a ApiErrorCode
 *
 * @param statusCode - Código de estado HTTP
 * @returns Código de error correspondiente
 */
function mapHttpStatusToErrorCode(statusCode: number): string {
  const statusMap: Record<number, string> = {
    400: ApiErrorCode.VALIDATION_ERROR,
    401: ApiErrorCode.UNAUTHORIZED,
    403: ApiErrorCode.FORBIDDEN,
    404: ApiErrorCode.NOT_FOUND,
    409: ApiErrorCode.CONFLICT,
    422: ApiErrorCode.VALIDATION_ERROR, // Unprocessable Entity (validation error)
    500: ApiErrorCode.INTERNAL_SERVER_ERROR,
    503: ApiErrorCode.SERVICE_UNAVAILABLE,
  }

  return statusMap[statusCode] || ApiErrorCode.INTERNAL_SERVER_ERROR
}

/**
 * Genera mensajes de error por defecto en español según el código HTTP
 *
 * @param statusCode - Código de estado HTTP
 * @returns Mensaje de error en español
 */
function getDefaultErrorMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: 'Los datos proporcionados son inválidos. Por favor, revise el formulario.',
    401: 'Debe iniciar sesión para continuar.',
    403: 'No tiene permisos para realizar esta acción.',
    404: 'El recurso solicitado no existe o ha sido eliminado.',
    409: 'Ya existe un registro con estos datos. Por favor, use valores únicos.',
    422: 'Los datos proporcionados no cumplen con las reglas de validación. Por favor, revise los campos.',
    500: 'Error interno del servidor. Nuestro equipo ha sido notificado.',
    503: 'El servicio no está disponible temporalmente. Intente más tarde.',
  }

  return messages[statusCode] || 'Ha ocurrido un error inesperado. Intente nuevamente.'
}

/**
 * Extrae errores de validación por campo de la respuesta de Django
 *
 * Django REST Framework puede devolver errores en varios formatos:
 * - {field_name: ["error1", "error2"]}
 * - {field_errors: {field_name: ["error1"]}}
 *
 * @param data - Datos de respuesta de Django
 * @returns Objeto con errores por campo o undefined
 */
function extractDjangoFieldErrors(
  data: any
): Record<string, string[]> | undefined {
  if (!data || typeof data !== 'object') return undefined

  // Formato 1: {field_errors: {...}}
  if (data.field_errors && typeof data.field_errors === 'object') {
    return data.field_errors
  }

  // Formato 2: Campos directamente en el objeto
  const fieldErrors: Record<string, string[]> = {}
  let hasErrors = false

  for (const [key, value] of Object.entries(data)) {
    // Verificar si el valor es un array de strings (errores)
    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      fieldErrors[key] = value
      hasErrors = true
    }
  }

  return hasErrors ? fieldErrors : undefined
}
