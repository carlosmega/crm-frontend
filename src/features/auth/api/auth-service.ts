/**
 * Authentication Service
 *
 * Servicio para autenticación con Django backend
 * Endpoints: /api/auth/login, /api/auth/logout, /api/auth/me, /api/auth/change-password
 */

import apiClient, { unwrapBackendResponse } from '@/core/api/client'
import type {
  LoginCredentials,
  LoginResponse,
  ChangePasswordDto,
  AuthUser,
} from '../types'
import type { ApiSuccessResponse } from '@/core/contracts/api/api-response'

class AuthService {
  private readonly basePath = '/auth'

  /**
   * Login con email y contraseña
   *
   * Django establece la cookie de sesión y el CSRF token al hacer login exitoso
   *
   * @param credentials - Email (emailaddress1) y password
   * @returns Usuario autenticado y mensaje de bienvenida
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `${this.basePath}/login`,
      credentials
    )
    // Django devuelve {success: true, message: "...", user: {...}} directamente
    // No necesitamos unwrapBackendResponse aquí
    return response.data
  }

  /**
   * Logout del usuario actual
   *
   * Limpia la sesión de Django y las cookies
   */
  async logout(): Promise<void> {
    await apiClient.post(`${this.basePath}/logout`)
  }

  /**
   * Obtener usuario autenticado actual
   *
   * @returns Usuario actual o error 401 si no está autenticado
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await apiClient.get<ApiSuccessResponse<AuthUser>>(
      `${this.basePath}/me`
    )
    return unwrapBackendResponse(Promise.resolve(response))
  }

  /**
   * Cambiar contraseña del usuario actual
   *
   * @param dto - Contraseña actual y nueva contraseña
   */
  async changePassword(dto: ChangePasswordDto): Promise<void> {
    await apiClient.post(`${this.basePath}/change-password`, dto)
  }
}

/**
 * Instancia singleton del servicio de autenticación
 */
export const authService = new AuthService()
