/**
 * Order Detail Service - Backend Implementation
 *
 * Implementación del servicio de order details usando Django REST API
 * Maneja las líneas de productos (Order Lines) de una orden
 */

import apiClient from '@/core/api/client'
import type {
  OrderDetail,
  CreateOrderDetailDto,
  UpdateOrderDetailDto,
} from '@/core/contracts/entities/order-detail'

/**
 * Order Detail Service Backend
 *
 * IMPORTANTE: El backend Django calcula los totales automáticamente
 * cuando se agregan/actualizan/eliminan líneas
 */
class OrderDetailServiceBackend {
  private readonly basePath = '/orders'

  /**
   * Obtener todas las líneas de una orden
   *
   * @param orderId - ID de la orden
   * @returns Lista de order lines
   */
  async getByOrder(orderId: string): Promise<OrderDetail[]> {
    try {
      // El backend devuelve la orden completa con order_details incluido
      const response = await apiClient.get<{
        order_details: OrderDetail[]
        [key: string]: any
      }>(`${this.basePath}/${orderId}`)

      // Extraer solo las líneas de productos
      return response.data.order_details || []
    } catch (error: any) {
      if (error.error?.code === 'NOT_FOUND') {
        return []
      }
      throw error
    }
  }

  /**
   * Obtener una order line por ID
   *
   * @param id - ID de la order line
   * @returns Order line o null si no existe
   */
  async getById(id: string): Promise<OrderDetail | null> {
    try {
      const response = await apiClient.get<OrderDetail>(
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
   * Crear nueva línea de producto en la orden
   *
   * El backend calcula automáticamente:
   * - baseamount
   * - extendedamount
   * - totales de la Order
   *
   * @param dto - Datos de la línea de producto
   * @returns Order line creada
   */
  async create(dto: CreateOrderDetailDto): Promise<OrderDetail> {
    const response = await apiClient.post<OrderDetail>(
      `${this.basePath}/${dto.salesorderid}/details`,
      dto
    )

    return response.data
  }

  /**
   * Actualizar línea de producto existente
   *
   * El backend recalcula automáticamente:
   * - baseamount
   * - extendedamount
   * - totales de la Order
   *
   * @param id - ID de la order line
   * @param dto - Campos a actualizar
   * @returns Order line actualizada
   */
  async update(
    id: string,
    dto: UpdateOrderDetailDto
  ): Promise<OrderDetail | null> {
    try {
      const response = await apiClient.patch<OrderDetail>(
        `${this.basePath}/details/${id}`,
        dto
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
   * El backend recalcula automáticamente los totales de la Order
   *
   * @param id - ID de la order line
   * @returns true si se eliminó
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
   * @returns Lista de order lines creadas
   */
  async bulkCreate(dtos: CreateOrderDetailDto[]): Promise<OrderDetail[]> {
    if (dtos.length === 0) return []

    // Crear todas las líneas en paralelo
    const promises = dtos.map((dto) => this.create(dto))
    const results = await Promise.all(promises)

    return results
  }

  /**
   * Eliminar todas las líneas de una orden
   *
   * @param orderId - ID de la orden
   * @returns Número de líneas eliminadas
   */
  async deleteByOrder(orderId: string): Promise<number> {
    // Obtener todas las líneas de la order
    const details = await this.getByOrder(orderId)

    // Eliminar todas en paralelo
    const promises = details.map((detail) => this.delete(detail.salesorderdetailid))
    const results = await Promise.all(promises)

    // Contar cuántas se eliminaron exitosamente
    return results.filter((success) => success).length
  }

  /**
   * Copiar líneas de quote a order
   *
   * Se usa cuando se crea una Order desde una Quote
   *
   * @param orderId - ID de la orden
   * @param quoteLines - Líneas de la quote
   * @returns Líneas de orden creadas
   */
  async copyFromQuoteLines(
    orderId: string,
    quoteLines: Array<{
      productid?: string
      productdescription?: string
      quantity: number
      priceperunit: number
      manualdiscountamount?: number
      tax?: number
    }>
  ): Promise<OrderDetail[]> {
    // Convertir quote lines a DTOs de order details
    const dtos: CreateOrderDetailDto[] = quoteLines.map((line) => ({
      salesorderid: orderId,
      productid: line.productid,
      productdescription: line.productdescription,
      quantity: line.quantity,
      priceperunit: line.priceperunit,
      manualdiscountamount: line.manualdiscountamount,
      tax: line.tax,
    }))

    // Crear todas las líneas usando bulkCreate
    return this.bulkCreate(dtos)
  }

  /**
   * Obtener estadísticas de order lines
   *
   * Calcula estadísticas en el frontend (debe coincidir con mock)
   *
   * @param orderId - ID de la orden
   * @returns Estadísticas de las líneas
   */
  async getStatistics(orderId: string): Promise<{
    totalLines: number
    totalQuantity: number
    totalShipped: number
    totalBackordered: number
    totalCancelled: number
    averageLineValue: number
  }> {
    const details = await this.getByOrder(orderId)

    const totalLines = details.length
    const totalQuantity = details.reduce((sum, d) => sum + d.quantity, 0)
    const totalShipped = details.reduce((sum, d) => sum + (d.quantityshipped || 0), 0)
    const totalBackordered = details.reduce((sum, d) => sum + (d.quantitybackordered || 0), 0)
    const totalCancelled = details.reduce((sum, d) => sum + (d.quantitycancelled || 0), 0)
    const totalValue = details.reduce((sum, d) => sum + d.extendedamount, 0)
    const averageLineValue = totalLines > 0 ? totalValue / totalLines : 0

    return {
      totalLines,
      totalQuantity,
      totalShipped,
      totalBackordered,
      totalCancelled,
      averageLineValue,
    }
  }
}

/**
 * Instancia singleton del servicio de order details (backend)
 */
export const orderDetailServiceBackend = new OrderDetailServiceBackend()
