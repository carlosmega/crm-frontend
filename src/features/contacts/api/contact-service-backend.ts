/**
 * Contact Service - Backend Implementation
 *
 * Implementación del servicio de contactos usando Django REST API
 * Endpoints: /api/contacts/
 */

import apiClient from '@/core/api/client'
import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
} from '@/core/contracts/entities/contact'

/**
 * Contact Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 * Por lo tanto NO usamos unwrapBackendResponse aquí
 */
class ContactServiceBackend {
  private readonly basePath = '/contacts/'

  /**
   * Obtener todos los contactos
   *
   * @param parentCustomerId - Opcional: Filtrar por Account (B2B)
   * @returns Lista de contactos
   */
  async getAll(parentCustomerId?: string): Promise<Contact[]> {
    const params = parentCustomerId
      ? { parentcustomerid: parentCustomerId }
      : undefined

    const response = await apiClient.get<Contact[]>(
      this.basePath,
      { params }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Obtener contactos por Account (alias de getAll con filtro)
   *
   * @param accountId - ID de la cuenta (empresa)
   * @returns Contactos vinculados a esa cuenta
   */
  async getByAccount(accountId: string): Promise<Contact[]> {
    return this.getAll(accountId)
  }

  /**
   * Obtener contacto por ID
   *
   * @param id - ID del contacto (contactid)
   * @returns Contacto o null si no existe
   */
  async getById(id: string): Promise<Contact | null> {
    try {
      const response = await apiClient.get<Contact>(
        `${this.basePath}${id}`
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
   * Buscar contactos por término
   *
   * Django busca en firstname, lastname, emailaddress1
   *
   * @param searchTerm - Término de búsqueda
   * @returns Contactos que coinciden con la búsqueda
   */
  async search(searchTerm: string): Promise<Contact[]> {
    const response = await apiClient.get<Contact[]>(
      this.basePath,
      {
        params: { search: searchTerm },
      }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Crear nuevo contacto
   *
   * @param dto - Datos del contacto (firstname, lastname, emailaddress1, etc.)
   * @returns Contacto creado con ID asignado
   */
  async create(dto: CreateContactDto): Promise<Contact> {
    const response = await apiClient.post<Contact>(
      this.basePath,
      dto
    )

    // Django devuelve el objeto creado directo: {...}
    return response.data
  }

  /**
   * Actualizar contacto existente
   *
   * @param id - ID del contacto
   * @param dto - Campos a actualizar (todos opcionales)
   * @returns Contacto actualizado o null si no existe
   */
  async update(id: string, dto: UpdateContactDto): Promise<Contact | null> {
    try {
      const response = await apiClient.patch<Contact>(
        `${this.basePath}${id}`,
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
   * Eliminar contacto (hard delete)
   *
   * @param id - ID del contacto
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}${id}`)
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
   * Desactivar contacto (soft delete)
   *
   * Cambia statecode a Inactive (1) en lugar de eliminar
   *
   * @param id - ID del contacto
   * @returns Contacto desactivado o null si no existe
   */
  async deactivate(id: string): Promise<Contact | null> {
    try {
      // Hacer llamada directa al endpoint de deactivate
      const response = await apiClient.patch<Contact>(
        `${this.basePath}${id}`,
        { statecode: 1 } // ContactStateCode.Inactive
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
 * Instancia singleton del servicio de contactos (backend)
 */
export const contactServiceBackend = new ContactServiceBackend()
