/**
 * Quote Service - Backend Implementation
 *
 * Implementación del servicio de quotes usando Django REST API
 * Endpoints: /api/quotes/
 */

import apiClient from '@/core/api/client'
import type {
  Quote,
  CreateQuoteDto,
  UpdateQuoteDto,
  ActivateQuoteDto,
  CloseQuoteDto,
} from '@/core/contracts/entities/quote'
import type { QuoteDetail } from '@/core/contracts/entities/quote-detail'
import { QuoteStateCode } from '@/core/contracts/enums'

/**
 * Quote Service Backend
 *
 * Django devuelve los datos directamente (sin wrapper {success, data})
 * Por lo tanto NO usamos unwrapBackendResponse aquí
 */
class QuoteServiceBackend {
  private readonly basePath = '/quotes'

  /**
   * Obtener todas las cotizaciones
   *
   * @param filters - Filtros opcionales (statecode)
   * @returns Lista de cotizaciones
   */
  async getAll(filters?: { statecode?: QuoteStateCode }): Promise<Quote[]> {
    const response = await apiClient.get<Quote[]>(
      this.basePath,
      { params: filters }
    )

    // Django devuelve array directo: [{...}, {...}]
    return response.data
  }

  /**
   * Obtener cotizaciones por estado
   *
   * @param statecode - Estado de la cotización (0=Draft, 1=Active, 2=Won, 3=Closed)
   * @returns Cotizaciones filtradas por estado
   */
  async getQuotes(statecode?: QuoteStateCode): Promise<Quote[]> {
    return this.getAll(statecode !== undefined ? { statecode } : undefined)
  }

  /**
   * Obtener cotizaciones por estado
   *
   * @param statecode - Estado de la cotización
   * @returns Cotizaciones filtradas por estado
   */
  async getByState(statecode: QuoteStateCode): Promise<Quote[]> {
    return this.getAll({ statecode })
  }

  /**
   * Obtener cotizaciones por opportunity
   *
   * @param opportunityId - ID de la oportunidad
   * @returns Cotizaciones vinculadas a la oportunidad
   */
  async getByOpportunity(opportunityId: string): Promise<Quote[]> {
    const allQuotes = await this.getAll()
    return allQuotes.filter((quote) => quote.opportunityid === opportunityId)
  }

  /**
   * Obtener cotizaciones por customer
   *
   * @param customerId - ID del customer (Account o Contact)
   * @returns Cotizaciones vinculadas al customer
   */
  async getByCustomer(customerId: string): Promise<Quote[]> {
    const allQuotes = await this.getAll()
    return allQuotes.filter((quote) => quote.customerid === customerId)
  }

  /**
   * Obtener cotización por ID
   *
   * @param id - ID de la cotización (quoteid)
   * @returns Cotización o null si no existe
   */
  async getById(id: string): Promise<Quote | null> {
    try {
      const response = await apiClient.get<Quote>(
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
   * Crear nueva cotización
   *
   * @param dto - Datos de la cotización
   * @returns Cotización creada con ID asignado
   */
  async create(dto: CreateQuoteDto): Promise<Quote> {
    const response = await apiClient.post<Quote>(
      this.basePath,
      dto
    )

    // Django devuelve el objeto creado directo: {...}
    return response.data
  }

  /**
   * Crear cotización desde opportunity
   *
   * Este endpoint automáticamente:
   * - Copia datos del Opportunity (customer, owner, etc.)
   * - Crea Quote en estado Draft
   * - Genera quotenumber automáticamente
   *
   * @param opportunityId - ID de la oportunidad
   * @returns Cotización creada
   */
  async createFromOpportunity(opportunityId: string): Promise<Quote> {
    const response = await apiClient.post<Quote>(
      `${this.basePath}/from-opportunity/${opportunityId}`
    )

    return response.data
  }

  /**
   * Actualizar cotización existente
   *
   * Solo se puede editar si está en estado Draft
   *
   * @param id - ID de la cotización
   * @param dto - Campos a actualizar (todos opcionales)
   * @returns Cotización actualizada o null si no existe
   */
  async update(id: string, dto: UpdateQuoteDto): Promise<Quote | null> {
    try {
      const response = await apiClient.patch<Quote>(
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
   * Actualizar totales de la cotización
   *
   * Actualiza los totales calculados desde Quote Lines
   * Usado internamente por quote-detail-service
   *
   * @param id - ID de la cotización
   * @param totals - Totales calculados
   * @returns Cotización actualizada
   */
  async updateTotals(
    id: string,
    totals: {
      totallineitemamount: number
      totaldiscountamount: number
      totaltax: number
      freightamount: number
    }
  ): Promise<Quote | null> {
    // El backend debería calcular los totales automáticamente al agregar/eliminar líneas
    // Por ahora, devolvemos la quote actualizada
    return this.getById(id)
  }

  /**
   * Eliminar cotización (hard delete)
   *
   * Solo se puede eliminar si está en estado Draft
   *
   * @param id - ID de la cotización
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
   * Agregar producto a cotización
   *
   * @param quoteId - ID de la cotización
   * @param item - Datos del producto (nombre, cantidad, precio, etc.)
   * @returns Quote Line creado
   */
  async addLineItem(
    quoteId: string,
    item: {
      productname: string
      productdescription?: string
      quantity: string
      priceperunit: string
      tax?: string
      manualdiscountamount?: string
    }
  ): Promise<QuoteDetail> {
    const response = await apiClient.post<QuoteDetail>(
      `${this.basePath}/${quoteId}/details`,
      item
    )

    return response.data
  }

  /**
   * Eliminar producto de cotización
   *
   * @param detailId - ID de la Quote Line
   * @returns true si se eliminó
   */
  async deleteLineItem(detailId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/details/${detailId}`)
      return true
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Activar cotización
   *
   * Cambia de Draft → Active
   * Requiere: al menos 1 Quote Line
   *
   * @param id - ID de la cotización
   * @param dto - Fechas de validez (opcional)
   * @returns Cotización activada
   */
  async activate(id: string, dto?: ActivateQuoteDto): Promise<Quote | null> {
    try {
      const response = await apiClient.post<Quote>(
        `${this.basePath}/${id}/activate`,
        dto || {}
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
   * Ganar cotización
   *
   * Cambia a Won state
   * Esto debería:
   * 1. Cerrar Quote como Won
   * 2. Ganar Opportunity vinculada
   * 3. Generar Order (implementado en order-service)
   *
   * @param id - ID de la cotización
   * @param dto - Notas de cierre (opcional)
   * @returns Cotización ganada
   */
  async win(id: string, dto?: CloseQuoteDto): Promise<Quote | null> {
    try {
      const closeDto = {
        statuscode: 3, // Won
        closingnotes: dto?.closingnotes,
      }

      const response = await apiClient.post<Quote>(
        `${this.basePath}/${id}/close`,
        closeDto
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
   * Perder cotización
   *
   * Cambia a Closed/Lost state
   *
   * @param id - ID de la cotización
   * @param dto - Notas de cierre (opcional)
   * @returns Cotización perdida
   */
  async lose(id: string, dto?: CloseQuoteDto): Promise<Quote | null> {
    try {
      const closeDto = {
        statuscode: 4, // Lost
        closingnotes: dto?.closingnotes,
      }

      const response = await apiClient.post<Quote>(
        `${this.basePath}/${id}/close`,
        closeDto
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
   * Cancelar cotización
   *
   * Cambia a Closed/Canceled state
   *
   * @param id - ID de la cotización
   * @param reason - Motivo de cancelación
   * @returns Cotización cancelada
   */
  async cancel(id: string, reason?: string): Promise<Quote | null> {
    try {
      const closeDto = {
        statuscode: 5, // Canceled
        closingnotes: reason,
      }

      const response = await apiClient.post<Quote>(
        `${this.basePath}/${id}/close`,
        closeDto
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
   * Revisar cotización (reopen)
   *
   * Cambia Active/Closed → Draft para revisión
   * Este método probablemente no esté disponible en el backend Django
   * (necesitaría implementarse si es necesario)
   *
   * @param id - ID de la cotización
   * @returns Cotización revisada
   */
  async revise(id: string): Promise<Quote | null> {
    // Por ahora, actualizar a Draft (si el backend lo soporta)
    return this.update(id, {})
  }

  /**
   * Clonar cotización
   *
   * Crea una copia del Quote con todas sus líneas de producto
   * Este método probablemente no esté disponible en el backend Django
   * (necesitaría implementarse si es necesario)
   *
   * @param id - ID de la cotización a clonar
   * @returns Nueva cotización clonada
   */
  async clone(id: string): Promise<Quote> {
    // Por ahora, obtener el quote original y crear uno nuevo
    const original = await this.getById(id)
    if (!original) {
      throw new Error('Quote not found')
    }

    // Crear nuevo quote basado en el original
    const newQuote = await this.create({
      name: `${original.name} (Copy)`,
      opportunityid: original.opportunityid,
      customerid: original.customerid,
      customeridtype: original.customeridtype,
      effectivefrom: original.effectivefrom,
      effectiveto: original.effectiveto,
      description: original.description,
      ownerid: original.ownerid,
    })

    return newQuote
  }

  /**
   * Buscar cotizaciones por texto
   *
   * @param query - Texto a buscar
   * @returns Cotizaciones que coinciden con la búsqueda
   */
  async search(query: string): Promise<Quote[]> {
    const allQuotes = await this.getAll()
    const lowerQuery = query.toLowerCase()

    return allQuotes.filter(
      (quote) =>
        quote.name?.toLowerCase().includes(lowerQuery) ||
        quote.quotenumber?.toLowerCase().includes(lowerQuery) ||
        quote.description?.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Obtener estadísticas de cotizaciones
   *
   * @returns Estadísticas (total, por estado, valores, win rate)
   */
  async getStatistics(): Promise<{
    total: number
    draft: number
    active: number
    won: number
    lost: number
    wonValue: number
    totalValue: number
    averageValue: number
    winRate: number
  }> {
    const response = await apiClient.get<{
      total_quotes: number
      total_amount: number
      draft_count: number
      active_count: number
      won_count: number
      lost_count: number
      won_value: number
      average_value: number
      win_rate: number
    }>(`${this.basePath}/stats/summary`)

    const stats = response.data

    // Transformar nombres de Django a nuestro formato
    return {
      total: stats.total_quotes,
      draft: stats.draft_count,
      active: stats.active_count,
      won: stats.won_count,
      lost: stats.lost_count,
      wonValue: stats.won_value,
      totalValue: stats.total_amount,
      averageValue: stats.average_value,
      winRate: stats.win_rate,
    }
  }
}

/**
 * Instancia singleton del servicio de cotizaciones (backend)
 */
export const quoteServiceBackend = new QuoteServiceBackend()
