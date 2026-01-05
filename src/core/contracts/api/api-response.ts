/**
 * API Response (Success/Error Wrappers)
 *
 * Tipos para estandarizar respuestas de API
 */

/**
 * Success Response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error Response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;  // Errores de validación por campo
  };
}

/**
 * API Response (Union type)
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Error Codes
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',

  // Resource
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Business Logic
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  LEAD_ALREADY_QUALIFIED = 'LEAD_ALREADY_QUALIFIED',
  OPPORTUNITY_ALREADY_CLOSED = 'OPPORTUNITY_ALREADY_CLOSED',
  QUOTE_NOT_ACTIVE = 'QUOTE_NOT_ACTIVE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Server
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT'
}

/**
 * Helper para crear respuesta exitosa
 */
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Helper para crear respuesta de error
 */
export function createErrorResponse(
  code: ApiErrorCode,
  message: string,
  details?: Record<string, string[]>
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details
    }
  };
}

/**
 * Type guard para verificar si es error
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return !response.success;
}

/**
 * Type guard para verificar si es éxito
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success;
}
