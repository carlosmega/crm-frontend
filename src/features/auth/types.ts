/**
 * Authentication Types
 *
 * Tipos para autenticación con Django backend
 */

/**
 * Credenciales de login
 *
 * Nota: Django usa 'emailaddress1' (convención CDS) en lugar de 'email'
 */
export interface LoginCredentials {
  emailaddress1: string
  password: string
}

/**
 * Respuesta de login exitoso
 */
export interface LoginResponse {
  success: boolean
  message: string
  user: AuthUser
}

/**
 * Usuario autenticado
 *
 * Nota: Django devuelve systemuserid y role_name
 */
export interface AuthUser {
  systemuserid: string
  fullname: string
  emailaddress1: string
  jobtitle?: string
  role_name?: string
  isdisabled?: boolean
}

/**
 * Datos para cambio de contraseña
 */
export interface ChangePasswordDto {
  current_password: string
  new_password: string
}
