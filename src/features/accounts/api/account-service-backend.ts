/**
 * Account Service - Backend Implementation
 *
 * Implementación del servicio de cuentas usando Django REST API
 * Endpoints: /api/accounts/
 */

import apiClient from '@/core/api/client'
import type {
  Account,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/core/contracts/entities/account'

/**
 * Account Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 * Por lo tanto NO usamos unwrapBackendResponse aquí
 */
class AccountServiceBackend {
  private readonly basePath = '/accounts'

  /**
   * Obtener todas las cuentas
   *
   * @param filters - Filtros opcionales (search, statecode)
   * @returns Lista de cuentas
   */
  async getAll(filters?: { search?: string; statecode?: number }): Promise<Account[]> {
    const response = await apiClient.get<Account[]>(
      this.basePath,
      { params: filters }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Obtener cuenta por ID
   *
   * @param id - ID de la cuenta (accountid)
   * @returns Cuenta o null si no existe
   */
  async getById(id: string): Promise<Account | null> {
    try {
      const response = await apiClient.get<Account>(
        `${this.basePath}/${id}`
      )

      // Django devuelve el objeto directo: {...}
      return response.data
    } catch (error: any) {
      // Si es 404, devolver null en lugar de lanzar error
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Buscar cuentas por nombre
   *
   * Django busca en el campo 'name'
   *
   * @param name - Término de búsqueda
   * @returns Cuentas que coinciden con la búsqueda
   */
  async searchByName(name: string): Promise<Account[]> {
    const response = await apiClient.get<Account[]>(
      this.basePath,
      {
        params: { search: name },
      }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Crear nueva cuenta
   *
   * @param dto - Datos de la cuenta (name, accountnumber, emailaddress1, etc.)
   * @returns Cuenta creada con ID asignado
   */
  async create(dto: CreateAccountDto): Promise<Account> {
    const response = await apiClient.post<Account>(
      this.basePath,
      dto
    )

    // Django devuelve el objeto creado directo: {...}
    return response.data
  }

  /**
   * Actualizar cuenta existente
   *
   * @param id - ID de la cuenta
   * @param dto - Campos a actualizar (todos opcionales)
   * @returns Cuenta actualizada o null si no existe
   */
  async update(id: string, dto: UpdateAccountDto): Promise<Account | null> {
    try {
      const response = await apiClient.patch<Account>(
        `${this.basePath}/${id}`,
        dto
      )

      // Django devuelve el objeto actualizado directo: {...}
      return response.data
    } catch (error: any) {
      // Si es 404, devolver null en lugar de lanzar error
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Eliminar cuenta (hard delete)
   *
   * @param id - ID de la cuenta
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
      return true
    } catch (error: any) {
      // Si es 404, devolver false en lugar de lanzar error
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Activar cuenta
   *
   * Cambia statecode a Active (0)
   *
   * @param id - ID de la cuenta
   * @returns Cuenta activada o null si no existe
   */
  async activate(id: string): Promise<Account | null> {
    try {
      const response = await apiClient.patch<Account>(
        `${this.basePath}/${id}`,
        { statecode: 0 } // AccountStateCode.Active
      )
      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }

  /**
   * Desactivar cuenta (soft delete)
   *
   * Cambia statecode a Inactive (1) en lugar de eliminar
   *
   * @param id - ID de la cuenta
   * @returns Cuenta desactivada o null si no existe
   */
  async deactivate(id: string): Promise<Account | null> {
    try {
      const response = await apiClient.patch<Account>(
        `${this.basePath}/${id}`,
        { statecode: 1 } // AccountStateCode.Inactive
      )
      return response.data
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return null
      }
      throw error
    }
  }
}

/**
 * Instancia singleton del servicio de cuentas (backend)
 */
export const accountServiceBackend = new AccountServiceBackend()
