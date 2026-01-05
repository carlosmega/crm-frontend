/**
 * Lead Service - Backend Implementation
 *
 * Implementación del servicio de leads usando Django REST API
 * Endpoints: /api/leads/
 */

import apiClient from '@/core/api/client'
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  QualifyLeadDto,
  QualifyLeadResponse,
} from '@/core/contracts/entities/lead'

/**
 * Lead Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 * Por lo tanto NO usamos unwrapBackendResponse aquí
 */
class LeadServiceBackend {
  private readonly basePath = '/leads'

  /**
   * Obtener todos los leads
   *
   * @param filters - Filtros opcionales (statecode, search)
   * @returns Lista de leads
   */
  async getAll(filters?: { statecode?: number; search?: string }): Promise<Lead[]> {
    const response = await apiClient.get<Lead[]>(
      this.basePath,
      { params: filters }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Obtener leads por estado
   *
   * @param statecode - Estado del lead (0=Open, 1=Qualified, 2=Disqualified)
   * @returns Leads filtrados por estado
   */
  async getByStatus(statecode: number): Promise<Lead[]> {
    return this.getAll({ statecode })
  }

  /**
   * Obtener lead por ID
   *
   * @param id - ID del lead (leadid)
   * @returns Lead o null si no existe
   */
  async getById(id: string): Promise<Lead | null> {
    try {
      const response = await apiClient.get<Lead>(
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
   * Crear nuevo lead
   *
   * @param dto - Datos del lead (lastname, emailaddress1, companyname, etc.)
   * @returns Lead creado con ID asignado
   */
  async create(dto: CreateLeadDto): Promise<Lead> {
    const response = await apiClient.post<Lead>(
      this.basePath,
      dto
    )

    // Django devuelve el objeto creado directo: {...}
    return response.data
  }

  /**
   * Actualizar lead existente
   *
   * @param id - ID del lead
   * @param dto - Campos a actualizar (todos opcionales)
   * @returns Lead actualizado o null si no existe
   */
  async update(id: string, dto: UpdateLeadDto): Promise<Lead | null> {
    try {
      const response = await apiClient.patch<Lead>(
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
   * Eliminar lead (hard delete)
   *
   * @param id - ID del lead
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
   * Calificar lead (Crea Opportunity + Account + Contact)
   *
   * Este endpoint es crítico en el flujo CDS:
   * - Cambia el lead a estado Qualified (1)
   * - Crea Opportunity vinculada al lead
   * - Opcionalmente crea Account (B2B) y/o Contact
   *
   * @param id - ID del lead
   * @param dto - Opciones de calificación
   * @returns Respuesta con IDs de entidades creadas
   */
  async qualify(id: string, dto: QualifyLeadDto): Promise<QualifyLeadResponse> {
    const response = await apiClient.post<QualifyLeadResponse>(
      `${this.basePath}/${id}/qualify`,
      dto
    )

    // Django devuelve: {success: true, lead_id, opportunity_id, account_id?, contact_id}
    return response.data
  }

  /**
   * Descalificar lead
   *
   * Cambia el lead a estado Disqualified (2)
   *
   * @param id - ID del lead
   * @param reason - Motivo de descalificación (opcional)
   * @returns Lead descalificado
   */
  async disqualify(id: string, reason?: string): Promise<Lead> {
    const response = await apiClient.post<Lead>(
      `${this.basePath}/${id}/disqualify`,
      { reason }
    )

    return response.data
  }

  /**
   * Obtener estadísticas de leads
   *
   * @returns Estadísticas (total, por estado, tasas de conversión)
   */
  async getStats(): Promise<any> {
    const response = await apiClient.get<any>(
      `${this.basePath}/stats`
    )

    return response.data
  }
}

/**
 * Instancia singleton del servicio de leads (backend)
 */
export const leadServiceBackend = new LeadServiceBackend()
