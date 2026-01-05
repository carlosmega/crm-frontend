/**
 * Opportunity Service - Backend Implementation
 *
 * Implementación del servicio de opportunities usando Django REST API
 * Endpoints: /api/opportunities/
 */

import apiClient from '@/core/api/client'
import type {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  CloseOpportunityDto,
} from '@/core/contracts/entities/opportunity'

/**
 * Opportunity Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 * Por lo tanto NO usamos unwrapBackendResponse aquí
 */
class OpportunityServiceBackend {
  private readonly basePath = '/opportunities'

  /**
   * Obtener todas las oportunidades
   *
   * @param filters - Filtros opcionales (statecode, salesstage, search)
   * @returns Lista de oportunidades
   */
  async getAll(filters?: { statecode?: number; salesstage?: number; search?: string }): Promise<Opportunity[]> {
    const response = await apiClient.get<Opportunity[]>(
      this.basePath,
      { params: filters }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Obtener oportunidades por estado
   *
   * @param statecode - Estado de la oportunidad (0=Open, 1=Won, 2=Lost)
   * @returns Oportunidades filtradas por estado
   */
  async getByStatus(statecode: number): Promise<Opportunity[]> {
    return this.getAll({ statecode })
  }

  /**
   * Obtener oportunidades originadas desde un lead específico
   *
   * @param leadId - ID del lead
   * @returns Oportunidades creadas desde ese lead
   */
  async getByLead(leadId: string): Promise<Opportunity[]> {
    const allOpportunities = await this.getAll()
    return allOpportunities.filter(opp => opp.originatingleadid === leadId)
  }

  /**
   * Obtener oportunidad por ID
   *
   * @param id - ID de la oportunidad (opportunityid)
   * @returns Oportunidad o null si no existe
   */
  async getById(id: string): Promise<Opportunity | null> {
    try {
      const response = await apiClient.get<Opportunity>(
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
   * Crear nueva oportunidad
   *
   * @param dto - Datos de la oportunidad (name, customerid, estimatedvalue, etc.)
   * @returns Oportunidad creada con ID asignado
   */
  async create(dto: CreateOpportunityDto): Promise<Opportunity> {
    const response = await apiClient.post<Opportunity>(
      this.basePath,
      dto
    )

    // Django devuelve el objeto creado directo: {...}
    return response.data
  }

  /**
   * Actualizar oportunidad existente
   *
   * @param id - ID de la oportunidad
   * @param dto - Campos a actualizar (todos opcionales)
   * @returns Oportunidad actualizada o null si no existe
   */
  async update(id: string, dto: UpdateOpportunityDto): Promise<Opportunity | null> {
    try {
      const response = await apiClient.patch<Opportunity>(
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
   * Eliminar oportunidad (hard delete)
   *
   * @param id - ID de la oportunidad
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.basePath}/${id}`)
    } catch (error: any) {
      // Si es 404, no lanzar error (ya fue eliminado)
      if (error.error?.code === 'NOT_FOUND') {
        return
      }
      throw error
    }
  }

  /**
   * Cerrar oportunidad (Win/Loss)
   *
   * Este endpoint es crítico en el flujo CDS:
   * - Cambia el estado a Won (1) o Lost (2)
   * - Actualiza actualrevenue y actualclosedate
   * - Si es Won, puede generar Quote/Order
   *
   * @param id - ID de la oportunidad
   * @param dto - Opciones de cierre (status, actualrevenue, actualclosedate, closingnotes)
   * @returns Oportunidad cerrada
   */
  async close(id: string, dto: CloseOpportunityDto): Promise<Opportunity> {
    const response = await apiClient.post<Opportunity>(
      `${this.basePath}/${id}/close`,
      dto
    )

    return response.data
  }

  /**
   * Obtener estadísticas de oportunidades
   *
   * @returns Estadísticas (total, por estado, tasas de conversión, pipeline value)
   */
  async getStats(): Promise<any> {
    const response = await apiClient.get<any>(
      `${this.basePath}/stats`
    )

    return response.data
  }

  /**
   * Move opportunity to next sales stage
   */
  async moveToNextStage(id: string): Promise<Opportunity> {
    const opportunity = await this.getById(id)
    if (!opportunity) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const nextStage = this.getNextSalesStage(opportunity.salesstage)
    if (nextStage === null) {
      throw new Error('Opportunity is already in final stage')
    }

    const updated = await this.update(id, { salesstage: nextStage })
    if (!updated) {
      throw new Error(`Failed to update opportunity ${id}`)
    }
    return updated
  }

  /**
   * Move opportunity to previous sales stage
   */
  async moveToPreviousStage(id: string): Promise<Opportunity> {
    const opportunity = await this.getById(id)
    if (!opportunity) {
      throw new Error(`Opportunity with id ${id} not found`)
    }

    const previousStage = this.getPreviousSalesStage(opportunity.salesstage)
    if (previousStage === null) {
      throw new Error('Opportunity is already in first stage')
    }

    const updated = await this.update(id, { salesstage: previousStage })
    if (!updated) {
      throw new Error(`Failed to update opportunity ${id}`)
    }
    return updated
  }

  /**
   * Close opportunity as Won (simplified wrapper for close method)
   */
  async closeAsWon(
    opportunityid: string,
    data: { actualrevenue: number; actualclosedate: string }
  ): Promise<Opportunity> {
    return this.close(opportunityid, {
      statecode: 1, // Won
      statuscode: 3, // Won
      actualvalue: data.actualrevenue,
      actualclosedate: data.actualclosedate,
    })
  }

  /**
   * Get next sales stage
   */
  private getNextSalesStage(currentStage: number): number | null {
    const stages = [0, 1, 2, 3] // Qualify, Develop, Propose, Close
    const currentIndex = stages.indexOf(currentStage)
    if (currentIndex === -1 || currentIndex === stages.length - 1) {
      return null
    }
    return stages[currentIndex + 1]
  }

  /**
   * Get previous sales stage
   */
  private getPreviousSalesStage(currentStage: number): number | null {
    const stages = [0, 1, 2, 3] // Qualify, Develop, Propose, Close
    const currentIndex = stages.indexOf(currentStage)
    if (currentIndex <= 0) {
      return null
    }
    return stages[currentIndex - 1]
  }
}

/**
 * Instancia singleton del servicio de oportunidades (backend)
 */
export const opportunityServiceBackend = new OpportunityServiceBackend()
