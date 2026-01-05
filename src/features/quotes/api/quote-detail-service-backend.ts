/**
 * Quote Detail Service - Backend Implementation
 *
 * Implementación del servicio de quote details usando Django REST API
 * Maneja las líneas de productos (Quote Lines) de una cotización
 */

import apiClient from '@/core/api/client'
import type {
  QuoteDetail,
  CreateQuoteDetailDto,
  UpdateQuoteDetailDto,
} from '@/core/contracts/entities/quote-detail'

/**
 * Quote Detail Service Backend
 *
 * IMPORTANTE: El backend Django calcula los totales automáticamente
 * cuando se agregan/actualizan/eliminan líneas, por lo que NO necesitamos
 * llamar a updateTotals() manualmente como en el servicio mock
 */
class QuoteDetailServiceBackend {
  private readonly basePath = '/quotes'

  /**
   * Obtener todas las líneas de una cotización
   *
   * @param quoteId - ID de la cotización
   * @returns Lista de quote lines
   */
  async getByQuote(quoteId: string): Promise<QuoteDetail[]> {
    try {
      const response = await apiClient.get<QuoteDetail[]>(
        `${this.basePath}/${quoteId}/details`
      )

      return response.data
    } catch (error: any) {
      // Si no hay endpoint específico para obtener lines, devolver array vacío
      if (error.error?.code === 'NOT_FOUND') {
        return []
      }
      throw error
    }
  }

  /**
   * Obtener una quote line por ID
   *
   * @param id - ID de la quote line
   * @returns Quote line o null si no existe
   */
  async getById(id: string): Promise<QuoteDetail | null> {
    try {
      const response = await apiClient.get<QuoteDetail>(
        `${this.basePath}/details/${id}`
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
   * Crear nueva línea de producto en la cotización
   *
   * El backend calcula automáticamente:
   * - baseamount
   * - extendedamount
   * - lineitemnumber
   * - totales del Quote
   *
   * @param dto - Datos de la línea de producto
   * @returns Quote line creada
   */
  async create(dto: CreateQuoteDetailDto): Promise<QuoteDetail> {
    const response = await apiClient.post<QuoteDetail>(
      `${this.basePath}/${dto.quoteid}/details`,
      {
        productname: dto.productid, // En el DTO usa productid, pero el backend espera productname
        productdescription: dto.productdescription,
        quantity: dto.quantity.toString(),
        priceperunit: dto.priceperunit.toString(),
        tax: dto.tax?.toString() || '0',
        manualdiscountamount: dto.manualdiscountamount?.toString() || '0',
      }
    )

    return response.data
  }

  /**
   * Actualizar línea de producto existente
   *
   * El backend recalcula automáticamente:
   * - baseamount
   * - extendedamount
   * - totales del Quote
   *
   * @param id - ID de la quote line
   * @param dto - Campos a actualizar
   * @returns Quote line actualizada
   */
  async update(
    id: string,
    dto: UpdateQuoteDetailDto
  ): Promise<QuoteDetail | null> {
    try {
      const response = await apiClient.patch<QuoteDetail>(
        `${this.basePath}/details/${id}`,
        {
          productdescription: dto.productdescription,
          quantity: dto.quantity?.toString(),
          priceperunit: dto.priceperunit?.toString(),
          tax: dto.tax?.toString(),
          manualdiscountamount: dto.manualdiscountamount?.toString(),
        }
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
   * Eliminar línea de producto
   *
   * El backend recalcula automáticamente los totales del Quote
   *
   * @param id - ID de la quote line
   * @returns true si se eliminó, false si no existía
   */
  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.basePath}/details/${id}`)
      return true
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return false
      }
      throw error
    }
  }

  /**
   * Crear múltiples líneas a la vez
   *
   * @param dtos - Lista de líneas a crear
   * @returns Lista de quote lines creadas
   */
  async bulkCreate(dtos: CreateQuoteDetailDto[]): Promise<QuoteDetail[]> {
    if (dtos.length === 0) return []

    // Crear todas las líneas en paralelo
    const promises = dtos.map((dto) => this.create(dto))
    const results = await Promise.all(promises)

    return results
  }

  /**
   * Eliminar todas las líneas de una cotización
   *
   * @param quoteId - ID de la cotización
   * @returns Número de líneas eliminadas
   */
  async deleteByQuote(quoteId: string): Promise<number> {
    // Obtener todas las líneas de la quote
    const details = await this.getByQuote(quoteId)

    // Eliminar todas en paralelo
    const promises = details.map((detail) => this.delete(detail.quotedetailid))
    const results = await Promise.all(promises)

    // Contar cuántas se eliminaron exitosamente
    return results.filter((success) => success).length
  }

  /**
   * Reordenar líneas de producto
   *
   * NOTA: Este método probablemente no esté disponible en el backend Django
   * Si se necesita, habría que implementarlo
   *
   * @param quoteId - ID de la cotización
   * @param detailIdsInOrder - Lista de IDs en el orden deseado
   * @returns Lista de quote lines reordenadas
   */
  async reorder(
    quoteId: string,
    detailIdsInOrder: string[]
  ): Promise<QuoteDetail[]> {
    // Por ahora, solo devolver las líneas en el orden actual
    // TODO: Implementar endpoint de reordenamiento en el backend si se necesita
    const details = await this.getByQuote(quoteId)

    // Ordenar según el array de IDs
    const orderedDetails = detailIdsInOrder
      .map((id) => details.find((d) => d.quotedetailid === id))
      .filter((d): d is QuoteDetail => d !== undefined)

    return orderedDetails
  }

  /**
   * Obtener estadísticas de quote lines
   *
   * Calcula estadísticas en el frontend ya que el backend
   * probablemente no tiene endpoint específico para esto
   *
   * @param quoteId - ID de la cotización
   * @returns Estadísticas de las líneas
   */
  async getStatistics(quoteId: string): Promise<{
    lineCount: number
    totalQuantity: number
    totalBeforeDiscount: number
    totalDiscount: number
    totalTax: number
    totalAmount: number
  }> {
    const details = await this.getByQuote(quoteId)

    const lineCount = details.length
    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0)
    const totalBeforeDiscount = details.reduce(
      (sum, d) => sum + d.baseamount,
      0
    )
    const totalDiscount = details.reduce(
      (sum, d) => sum + (d.manualdiscountamount || 0),
      0
    )
    const totalTax = details.reduce((sum, d) => sum + (d.tax || 0), 0)
    const totalAmount = details.reduce((sum, d) => sum + d.extendedamount, 0)

    return {
      lineCount,
      totalQuantity,
      totalBeforeDiscount,
      totalDiscount,
      totalTax,
      totalAmount,
    }
  }

  /**
   * Clonar líneas de una cotización a otra
   *
   * Útil para funcionalidad de Clone Quote
   *
   * @param sourceQuoteId - ID de la cotización origen
   * @param targetQuoteId - ID de la cotización destino
   * @returns Líneas clonadas
   */
  async cloneQuoteLines(
    sourceQuoteId: string,
    targetQuoteId: string
  ): Promise<QuoteDetail[]> {
    // Obtener líneas de la quote origen
    const sourceLines = await this.getByQuote(sourceQuoteId)

    if (sourceLines.length === 0) {
      return []
    }

    // Crear DTOs para bulk create
    const createDtos: CreateQuoteDetailDto[] = sourceLines.map((line) => ({
      quoteid: targetQuoteId,
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount,
      tax: line.tax,
    }))

    // Crear todas las líneas
    return await this.bulkCreate(createDtos)
  }
}

/**
 * Instancia singleton del servicio de quote details (backend)
 */
export const quoteDetailServiceBackend = new QuoteDetailServiceBackend()
